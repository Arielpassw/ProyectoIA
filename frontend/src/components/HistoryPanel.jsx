import {
  Clock3,
  RefreshCw,
  Shirt,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  clearPredictionHistory,
  getPredictionHistory,
} from "../services/api";

function formatDate(dateValue) {
  if (!dateValue) {
    return "Fecha no disponible";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getPredictionHistory();

      setHistory(response.items || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = async () => {
    const confirmed = window.confirm(
      "¿Deseas eliminar todo el historial?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await clearPredictionHistory();

      setHistory([]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="information-panel">
      <div className="panel-title-row">
        <div>
          <h2>Historial de clasificaciones</h2>

          <p>
            Revisa las prendas analizadas anteriormente.
          </p>
        </div>

        <div className="panel-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={loadHistory}
            disabled={loading}
          >
            <RefreshCw size={18} />
            Actualizar
          </button>

          <button
            type="button"
            className="danger-action"
            onClick={handleClear}
            disabled={
              deleting || history.length === 0
            }
          >
            <Trash2 size={18} />
            Vaciar
          </button>
        </div>
      </div>

      {error && (
        <div className="panel-error">{error}</div>
      )}

      {loading ? (
        <div className="panel-loading">
          Cargando historial...
        </div>
      ) : history.length === 0 ? (
        <div className="empty-panel">
          <Clock3 size={48} />

          <h3>No hay clasificaciones registradas</h3>

          <p>
            Los análisis realizados aparecerán en esta
            sección.
          </p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => {
            const prediction =
              item.prediction || {};

            return (
              <article
                className="history-card"
                key={item.id}
              >
                <div className="history-card-icon">
                  <Shirt size={24} />
                </div>

                <div className="history-card-content">
                  <h3>
                    {prediction.label ||
                      "Prenda no identificada"}
                  </h3>

                  <p>
                    Confianza:{" "}
                    <strong>
                      {Number(
                        prediction.confidence || 0
                      ).toFixed(2)}
                      %
                    </strong>
                  </p>

                  {item.dominant_color && (
                    <div className="history-color">
                      <span
                        style={{
                          backgroundColor:
                            item.dominant_color.hex,
                        }}
                      />

                      {item.dominant_color.name}
                    </div>
                  )}

                  <small>
                    {formatDate(item.date)}
                  </small>

                  <small>
                    Archivo:{" "}
                    {item.original_filename ||
                      "Sin nombre"}
                  </small>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default HistoryPanel;