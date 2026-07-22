import {
  BrainCircuit,
  RotateCcw,
  Shirt,
  Sparkles,
  Tag,
} from "lucide-react";

import Alternatives from "./Alternatives";
import ColorChips from "./ColorChips";
import Loader from "./Loader";

function EmptyResult() {
  return (
    <div className="empty-result">
      <div className="empty-result-icon">
        <BrainCircuit size={54} />
      </div>

      <h3>El resultado aparecerá aquí</h3>

      <p>
        Selecciona una imagen y pulsa “Analizar
        prenda”.
      </p>
    </div>
  );
}

function ResultCard({
  result,
  loading,
  preview,
  onReset,
}) {
  if (loading) {
    return (
      <section className="result-card">
        <div className="card-heading">
          <Sparkles size={22} />
          <h3>Resultado</h3>
        </div>

        <Loader />
      </section>
    );
  }

  if (!result) {
    return (
      <section className="result-card">
        <div className="card-heading">
          <Sparkles size={22} />
          <h3>Resultado</h3>
        </div>

        <EmptyResult />
      </section>
    );
  }

  const prediction = result.prediction || {};

  const confidence = Number(
    prediction.confidence || 0
  );

  const confidenceLevel =
    prediction.confidence_level || "No determinada";

  const characteristics =
    result.characteristics || [];

  return (
    <section className="result-card result-visible">
      <div className="card-heading">
        <Sparkles size={22} />
        <h3>Resultado</h3>
      </div>

      <div className="main-prediction">
        <div className="prediction-image">
          {preview ? (
            <img
              src={preview}
              alt="Prenda clasificada"
            />
          ) : (
            <Shirt size={80} />
          )}
        </div>

        <div className="prediction-information">
          <h2>{prediction.label}</h2>

          <span
            className={`confidence-badge confidence-${confidenceLevel.toLowerCase()}`}
          >
            Confianza {confidenceLevel.toLowerCase()}
          </span>

          <strong className="confidence-number">
            {confidence.toFixed(2)}%
          </strong>

          <div className="main-progress">
            <span
              style={{
                width: `${Math.min(
                  confidence,
                  100
                )}%`,
              }}
            />
          </div>

          <p>
            La IA tiene un {confidence.toFixed(2)}% de
            confianza en esta clasificación.
          </p>
        </div>
      </div>

      {!!characteristics.length && (
        <div className="characteristics-section">
          <h4>Características detectadas</h4>

          <div className="characteristics-list">
            {characteristics.map(
              (characteristic, index) => (
                <div
                  className="characteristic-chip"
                  key={`${characteristic.type}-${index}`}
                >
                  {characteristic.type === "color" ? (
                    <span
                      className="color-circle"
                      style={{
                        backgroundColor:
                          characteristic.hex,
                      }}
                    />
                  ) : characteristic.type ===
                    "model" ? (
                    <BrainCircuit size={17} />
                  ) : characteristic.type ===
                    "category" ? (
                    <Shirt size={17} />
                  ) : (
                    <Tag size={17} />
                  )}

                  <span>{characteristic.label}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <ColorChips colors={result.colors} />

      <Alternatives
        alternatives={result.alternatives}
      />

      <button
        type="button"
        className="analyze-again-button"
        onClick={onReset}
      >
        <RotateCcw size={19} />
        Analizar otra imagen
      </button>
    </section>
  );
}

export default ResultCard;