function ColorChips({ colors = [] }) {
  if (!colors.length) {
    return null;
  }

  return (
    <div className="color-section">
      <h4>Colores detectados</h4>

      <div className="color-chips">
        {colors.map((color) => (
          <div
            className="color-chip"
            key={`${color.name}-${color.hex}`}
          >
            <span
              className="color-circle"
              style={{
                backgroundColor: color.hex,
              }}
            />

            <span>{color.name}</span>

            <small>{color.percentage}%</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ColorChips;