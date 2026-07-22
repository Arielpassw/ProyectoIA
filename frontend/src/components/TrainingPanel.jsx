import {
    Activity,
    BrainCircuit,
    CalendarDays,
    Database,
    Gauge,
    Layers3,
    RefreshCw,
    Settings2,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";

import { Line } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";

import { getTrainingMetrics } from "../services/api";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function getLastValue(values = []) {
    if (!Array.isArray(values) || values.length === 0) {
        return 0;
    }

    return Number(values[values.length - 1] || 0);
}

function formatPercentage(value) {
    return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

function formatDecimal(value) {
    return Number(value || 0).toFixed(4);
}

function TrainingPanel() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadMetrics = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await getTrainingMetrics();

            setMetrics(response);
        } catch (requestError) {
            setMetrics(null);
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadMetrics();
    }, []);

    const epochs = metrics?.accuracy?.length || 0;

    const finalAccuracy = getLastValue(metrics?.accuracy);
    const finalValidationAccuracy = getLastValue(
        metrics?.val_accuracy
    );

    const finalLoss = getLastValue(metrics?.loss);
    const finalValidationLoss = getLastValue(
        metrics?.val_loss
    );

    const labels = useMemo(() => {
        return Array.from(
            { length: epochs },
            (_, index) => `Época ${index + 1}`
        );
    }, [epochs]);

    const accuracyData = useMemo(
        () => ({
            labels,
            datasets: [
                {
                    label: "Entrenamiento",
                    data: metrics?.accuracy || [],
                    borderColor: "#6D3DF5",
                    backgroundColor: "rgba(109, 61, 245, 0.18)",
                    pointBackgroundColor: "#6D3DF5",
                    pointBorderColor: "#FFFFFF",
                    pointHoverBackgroundColor: "#6D3DF5",
                    pointHoverBorderColor: "#FFFFFF",
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    fill: true,
                },
                {
                    label: "Validación",
                    data: metrics?.val_accuracy || [],
                    borderColor: "#2563EB",
                    backgroundColor: "rgba(37, 99, 235, 0.10)",
                    pointBackgroundColor: "#2563EB",
                    pointBorderColor: "#FFFFFF",
                    pointHoverBackgroundColor: "#2563EB",
                    pointHoverBorderColor: "#FFFFFF",
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    fill: false,
                },
            ],
        }),
        [labels, metrics]
    );

    const lossData = useMemo(
        () => ({
            labels,
            datasets: [
                {
                    label: "Entrenamiento",
                    data: metrics?.loss || [],
                    borderColor: "#F97316",
                    backgroundColor: "rgba(249, 115, 22, 0.16)",
                    pointBackgroundColor: "#F97316",
                    pointBorderColor: "#FFFFFF",
                    pointHoverBackgroundColor: "#F97316",
                    pointHoverBorderColor: "#FFFFFF",
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    fill: true,
                },
                {
                    label: "Validación",
                    data: metrics?.val_loss || [],
                    borderColor: "#EF4444",
                    backgroundColor: "rgba(239, 68, 68, 0.10)",
                    pointBackgroundColor: "#EF4444",
                    pointBorderColor: "#FFFFFF",
                    pointHoverBackgroundColor: "#EF4444",
                    pointHoverBorderColor: "#FFFFFF",
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    fill: false,
                },
            ],
        }),
        [labels, metrics]
    );

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
            mode: "index",
            intersect: false,
        },

        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    padding: 20,
                    color: "#667085",
                    font: {
                        size: 13,
                        weight: "500",
                    },
                },
            },

            tooltip: {
                enabled: true,
                backgroundColor: "#111827",
                titleColor: "#FFFFFF",
                bodyColor: "#FFFFFF",
                padding: 12,
                cornerRadius: 10,
                displayColors: true,
            },
        },

        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#667085",
                },
                border: {
                    color: "#E4E7EC",
                },
            },

            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(102, 112, 133, 0.14)",
                },
                ticks: {
                    color: "#667085",
                },
                border: {
                    display: false,
                },
            },
        },
    };

    if (loading) {
        return (
            <section className="training-panel">
                <div className="training-loading">
                    <Activity size={48} />
                    <h3>Cargando métricas del entrenamiento</h3>
                    <p>Consultando la información del modelo...</p>
                </div>
            </section>
        );
    }

    if (!metrics) {
        return (
            <section className="training-panel">
                <div className="training-empty">
                    <BrainCircuit size={54} />

                    <h2>No existen métricas de entrenamiento</h2>

                    <p>
                        Primero debe entrenarse el modelo para poder
                        visualizar las gráficas y los parámetros utilizados.
                    </p>

                    {error && (
                        <div className="training-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        className="refresh-training-button"
                        onClick={() => loadMetrics(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw size={18} />

                        {refreshing
                            ? "Consultando..."
                            : "Volver a consultar"}
                    </button>
                </div>
            </section>
        );
    }

    const config = metrics.config || {};

    return (
        <section className="training-panel">
            <div className="training-panel-header">
                <div>
                    <h2>Entrenamiento del modelo</h2>

                    <p>
                        Métricas y parámetros utilizados en la última
                        ejecución.
                    </p>
                </div>

                <button
                    type="button"
                    className="refresh-training-button"
                    onClick={() => loadMetrics(true)}
                    disabled={refreshing}
                >
                    <RefreshCw
                        size={18}
                        className={refreshing ? "rotating-icon" : ""}
                    />

                    {refreshing ? "Actualizando..." : "Actualizar"}
                </button>
            </div>

            <div className="training-information-bar">
                <div>
                    <CalendarDays size={19} />
                    <span>Último entrenamiento</span>
                    <strong>{metrics.date || "No disponible"}</strong>
                </div>

                <div>
                    <Database size={19} />
                    <span>Dataset</span>
                    <strong>Fashion-MNIST</strong>
                </div>

                <div>
                    <BrainCircuit size={19} />
                    <span>Modelo</span>
                    <strong>CNN</strong>
                </div>

                <div>
                    <Layers3 size={19} />
                    <span>Clases</span>
                    <strong>10</strong>
                </div>
            </div>

            <div className="metrics-summary-grid">
                <article className="metric-summary-card">
                    <div className="metric-summary-icon">
                        <TrendingUp size={25} />
                    </div>

                    <div>
                        <span>Accuracy de entrenamiento</span>

                        <strong>
                            {formatPercentage(finalAccuracy)}
                        </strong>

                        <small>Resultado de la última época</small>
                    </div>
                </article>

                <article className="metric-summary-card">
                    <div className="metric-summary-icon">
                        <Gauge size={25} />
                    </div>

                    <div>
                        <span>Accuracy de validación</span>

                        <strong>
                            {formatPercentage(
                                finalValidationAccuracy
                            )}
                        </strong>

                        <small>Rendimiento con datos de prueba</small>
                    </div>
                </article>

                <article className="metric-summary-card">
                    <div className="metric-summary-icon">
                        <TrendingDown size={25} />
                    </div>

                    <div>
                        <span>Loss de entrenamiento</span>

                        <strong>
                            {formatDecimal(finalLoss)}
                        </strong>

                        <small>Error de la última época</small>
                    </div>
                </article>

                <article className="metric-summary-card">
                    <div className="metric-summary-icon">
                        <Activity size={25} />
                    </div>

                    <div>
                        <span>Loss de validación</span>

                        <strong>
                            {formatDecimal(finalValidationLoss)}
                        </strong>

                        <small>Error sobre datos no entrenados</small>
                    </div>
                </article>
            </div>

            <div className="training-content-grid">
                <div className="training-charts-column">
                    <article className="training-chart-card">
                        <div className="chart-card-heading">
                            <div>
                                <h3>Accuracy por época</h3>

                                <p>
                                    Evolución de la precisión del modelo.
                                </p>
                            </div>

                            <TrendingUp size={24} />
                        </div>

                        <div className="chart-container">
                            <Line
                                data={accuracyData}
                                options={{
                                    ...chartOptions,
                                    scales: {
                                        ...chartOptions.scales,
                                        y: {
                                            beginAtZero: true,
                                            max: 1,
                                        },
                                    },
                                }}
                            />
                        </div>
                    </article>

                    <article className="training-chart-card">
                        <div className="chart-card-heading">
                            <div>
                                <h3>Loss por época</h3>

                                <p>
                                    Evolución del error durante el entrenamiento.
                                </p>
                            </div>

                            <TrendingDown size={24} />
                        </div>

                        <div className="chart-container">
                            <Line
                                data={lossData}
                                options={chartOptions}
                            />
                        </div>
                    </article>
                </div>

                <aside className="training-config-card">
                    <div className="training-config-heading">
                        <Settings2 size={24} />

                        <div>
                            <h3>Configuración utilizada</h3>

                            <p>
                                Hiperparámetros empleados durante el
                                entrenamiento.
                            </p>
                        </div>
                    </div>

                    <div className="training-config-list">
                        <div className="training-config-item">
                            <span>Épocas</span>
                            <strong>{config.epochs ?? epochs}</strong>
                        </div>

                        <div className="training-config-item">
                            <span>Batch size</span>
                            <strong>{config.batch_size ?? 32}</strong>
                        </div>

                        <div className="training-config-item">
                            <span>Learning rate</span>
                            <strong>
                                {config.learning_rate ?? 0.001}
                            </strong>
                        </div>

                        <div className="training-config-item">
                            <span>Optimizador</span>
                            <strong>
                                {String(
                                    config.optimizer || "Adam"
                                ).toUpperCase()}
                            </strong>
                        </div>

                        <div className="training-config-item">
                            <span>Dropout</span>
                            <strong>
                                {Number(
                                    config.dropout ?? 0.3
                                ).toFixed(2)}
                            </strong>
                        </div>

                        <div className="training-config-item">
                            <span>Épocas registradas</span>
                            <strong>{epochs}</strong>
                        </div>
                    </div>

                    <div className="training-explanation">
                        <h4>Interpretación</h4>

                        <p>
                            El accuracy representa el porcentaje de
                            clasificaciones correctas. El loss representa el
                            error del modelo, por lo que se espera que
                            disminuya a medida que avanza el entrenamiento.
                        </p>
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default TrainingPanel;