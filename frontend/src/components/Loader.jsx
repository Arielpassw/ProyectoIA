import { ScanSearch } from "lucide-react";

function Loader() {
  return (
    <div className="loader-container">
      <div className="scanner-animation">
        <ScanSearch size={50} />
      </div>

      <h3>Analizando la prenda</h3>

      <p>
        La inteligencia artificial está procesando la
        imagen.
      </p>

      <div className="loading-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default Loader;