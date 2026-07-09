let API_URL = document.getElementById('apiUrl').value.replace(/\/$/, '');
let modelTrained = false;

// ---- Charts setup ----
const ctxAcc = document.getElementById('accChart').getContext('2d');
const ctxLoss = document.getElementById('lossChart').getContext('2d');

function makeChart(ctx, yMinMax){
    const chart = new Chart(ctx, {
        type:'line',
        data:{ labels:[], datasets:[
        {label:'Entrenamiento', data:[], borderColor:'#2E5EAA', backgroundColor:'transparent', borderWidth:2, pointRadius:0, tension:.3},
        {label:'Validación', data:[], borderColor:'#C97A2B', backgroundColor:'transparent', borderWidth:2, pointRadius:0, tension:.3}
        ]},
        options:{
        responsive:true, animation:{duration:400},
        plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, font:{family:'Inter', size:11} } } },
        scales:{
            x:{ grid:{color:'#F0ECE1'}, ticks:{font:{family:'IBM Plex Mono', size:9}} },
            y:{ grid:{color:'#F0ECE1'}, ticks:{font:{family:'IBM Plex Mono', size:9}}, ...(yMinMax||{}) }
        }
        }
    });
    return chart;
}
const accChart = makeChart(ctxAcc, {min:0, max:1});
const lossChart = makeChart(ctxLoss, {});

function updateChartsFromHistory(history){
    const epochs = history.accuracy.length;
    const labels = Array.from({length:epochs}, (_,i)=>i+1);
    accChart.data.labels = labels;
    accChart.data.datasets[0].data = history.accuracy;
    accChart.data.datasets[1].data = history.val_accuracy;
    lossChart.data.labels = labels;
    lossChart.data.datasets[0].data = history.loss;
    lossChart.data.datasets[1].data = history.val_loss;
    accChart.update();
    lossChart.update();
}

function renderRunSummary(history, extra){
    const cfg = history.config || {};
    const rows = [
        ['Fecha', history.date || '—'],
        ['Épocas', cfg.epochs ?? '—'],
        ['Batch size', cfg.batch_size ?? '—'],
        ['Learning rate', cfg.learning_rate ?? '—'],
        ['Optimizador', cfg.optimizer ?? '—'],
        ['Dropout', cfg.dropout ?? '—'],
    ];
    if(extra && extra.training_time !== undefined) rows.push(['Tiempo de entrenamiento', extra.training_time + ' s']);
    document.getElementById('runSummary').innerHTML = rows.map(([k,v]) =>
        `<div class="info-row"><span>${k}</span><span>${v}</span></div>`
    ).join('');
}

// ---- Conexión con la API ----
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const apiUrlInput = document.getElementById('apiUrl');
const predictBtn = document.getElementById('predictBtn');

async function checkConnection(){
    statusDot.classList.remove('on','off');
    statusText.textContent = 'Conectando con la API...';
    API_URL = apiUrlInput.value.replace(/\/$/, '');
    try{
        const res = await fetch(API_URL + '/health');
        if(!res.ok) throw new Error('health no OK');
        await res.json();

        const statusRes = await fetch(API_URL + '/status');
        const statusData = await statusRes.json();
        modelTrained = !!statusData.trained;

        statusDot.classList.add('on');
        statusText.textContent = modelTrained ? 'Conectado · modelo entrenado' : 'Conectado · sin modelo entrenado';
        predictBtn.disabled = !(modelTrained && fileLoaded);

        // si ya hay métricas de una corrida previa, mostrarlas
        try{
        const metRes = await fetch(API_URL + '/metrics');
        if(metRes.ok){
            const history = await metRes.json();
            updateChartsFromHistory(history);
            renderRunSummary(history);
            const n = history.accuracy.length;
            document.getElementById('accTrain').textContent = (history.accuracy[n-1]*100).toFixed(2)+'%';
            document.getElementById('accVal').textContent = (history.val_accuracy[n-1]*100).toFixed(2)+'%';
            document.getElementById('lossTrain').textContent = history.loss[n-1].toFixed(4);
            document.getElementById('lossVal').textContent = history.val_loss[n-1].toFixed(4);
        }
        }catch(e){ /* sin métricas previas, no pasa nada */ }

    }catch(err){
        statusDot.classList.add('off');
        statusText.textContent = 'No se pudo conectar con la API';
        predictBtn.disabled = true;
    }
}
document.getElementById('reconnectBtn').addEventListener('click', checkConnection);
checkConnection();

// ---- UI bindings config ----
const dropout = document.getElementById('dropout');
const dropoutVal = document.getElementById('dropoutVal');
dropout.addEventListener('input', () => dropoutVal.textContent = parseFloat(dropout.value).toFixed(2));

document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('epochs').value = 10;
    document.getElementById('lr').value = 0.001;
    document.getElementById('batch').value = 32;
    document.getElementById('opt').value = "adam";
    dropout.value = 0.3; dropoutVal.textContent = "0.30";
});

// ---- Entrenamiento real ----
const trainBtn = document.getElementById('trainBtn');
const trainLoading = document.getElementById('trainLoading');
const trainError = document.getElementById('trainError');

trainBtn.addEventListener('click', async () => {
    trainError.classList.remove('shown'); trainError.textContent = '';
    const config = {
        epochs: parseInt(document.getElementById('epochs').value) || 10,
        batch_size: parseInt(document.getElementById('batch').value) || 32,
        learning_rate: parseFloat(document.getElementById('lr').value) || 0.001,
        optimizer: document.getElementById('opt').value,
        dropout: parseFloat(dropout.value)
    };

    trainBtn.disabled = true;
    trainLoading.classList.add('shown');
    statusText.textContent = 'Entrenando modelo...';

    try{
        // 1. Guardar configuración
        const cfgRes = await fetch(API_URL + '/config', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(config)
        });
        if(!cfgRes.ok) throw new Error('No se pudo guardar la configuración (' + cfgRes.status + ')');

        // 2. Entrenar (llamada síncrona real, puede tardar)
        const trainRes = await fetch(API_URL + '/train', { method:'POST' });
        if(!trainRes.ok){
        const errData = await trainRes.json().catch(()=>({detail:'Error desconocido'}));
        throw new Error(errData.detail || ('Error en /train (' + trainRes.status + ')'));
        }
        const trainData = await trainRes.json();

        // 3. Traer historial completo por época
        const metRes = await fetch(API_URL + '/metrics');
        const history = await metRes.json();
        updateChartsFromHistory(history);
        renderRunSummary(history, trainData);

        document.getElementById('accTrain').textContent = (trainData.accuracy*100).toFixed(2)+'%';
        document.getElementById('accVal').textContent = (trainData.val_accuracy*100).toFixed(2)+'%';
        document.getElementById('lossTrain').textContent = trainData.loss.toFixed(4);
        document.getElementById('lossVal').textContent = trainData.val_loss.toFixed(4);

        modelTrained = true;
        statusText.textContent = 'Conectado · modelo entrenado';
        predictBtn.disabled = !fileLoaded;

    }catch(err){
        trainError.textContent = '⚠ ' + err.message;
        trainError.classList.add('shown');
        statusText.textContent = 'Conectado · error en entrenamiento';
    }finally{
        trainBtn.disabled = false;
        trainLoading.classList.remove('shown');
    }
});

// ---- Predicción real ----
const fileInput = document.getElementById('fileInput');
const previewFrame = document.getElementById('previewFrame');
const uploadLabel = document.getElementById('uploadLabel');
const predictError = document.getElementById('predictError');
let fileLoaded = false;
let selectedFile = null;

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    selectedFile = file;
    const url = URL.createObjectURL(file);
    previewFrame.innerHTML = `<img src="${url}" alt="preview">`;
    uploadLabel.textContent = "📁 " + file.name;
    fileLoaded = true;
    predictBtn.disabled = !modelTrained;
    document.getElementById('predictResult').classList.remove('shown');
    document.getElementById('probList').style.display = 'none';
    predictError.classList.remove('shown');
});

predictBtn.addEventListener('click', async () => {
    if(!selectedFile) return;
    predictError.classList.remove('shown'); predictError.textContent = '';
    predictBtn.disabled = true;
    predictBtn.textContent = "⏳ Analizando...";

    try{
        const formData = new FormData();
        formData.append('file', selectedFile);

        const res = await fetch(API_URL + '/predict', { method:'POST', body: formData });
        if(!res.ok){
        const errData = await res.json().catch(()=>({detail:'Error desconocido'}));
        throw new Error(errData.detail || ('Error en /predict (' + res.status + ')'));
        }
        const data = await res.json();

        document.getElementById('prClass').textContent = data.prediction.toUpperCase();
        document.getElementById('prConf').textContent = data.confidence.toFixed(2) + '%';
        document.getElementById('predictResult').classList.add('shown');

        const sorted = Object.entries(data.probabilities)
        .map(([name, p]) => ({name, p}))
        .sort((a,b) => b.p - a.p)
        .slice(0,5);

        const probRows = document.getElementById('probRows');
        probRows.innerHTML = '';
        sorted.forEach(({p, name}, idx) => {
        const color = idx===0 ? '#3E7A57' : '#B9B2A0';
        const row = document.createElement('div');
        row.className = 'prob-row';
        row.innerHTML = `<span class="pname">${name}</span>
            <div class="pbar-track"><div class="pbar-fill" style="background:${color}"></div></div>
            <span class="pval">${p.toFixed(2)}%</span>`;
        probRows.appendChild(row);
        setTimeout(()=>{ row.querySelector('.pbar-fill').style.width = p+'%'; }, 30+idx*60);
        });
        document.getElementById('probList').style.display = 'block';

    }catch(err){
        predictError.textContent = '⚠ ' + err.message;
        predictError.classList.add('shown');
    }finally{
        predictBtn.disabled = false;
        predictBtn.textContent = "🔍 Predecir";
    }
});