import { Shirt } from "lucide-react";

function Alternatives({ alternatives = [] }) {
  if (!alternatives.length) {
    return null;
  }

  return (
    <div className="alternatives-section">
      <h4>Otras posibilidades</h4>

      <div className="alternatives-list">
        {alternatives.map((alternative) => {
          const percentage = Math.min(
            Math.max(alternative.probability, 0),
            100
          );

          return (
            <div
              className="alternative-item"
              key={alternative.label}
            >
              <div className="alternative-label">
                <span className="alternative-icon">
                  <Shirt size={18} />
                </span>

                <span>{alternative.label}</span>
              </div>

              <div className="alternative-progress">
                <div className="progress-track">
                  <span
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <strong>{percentage.toFixed(2)}%</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Alternatives;