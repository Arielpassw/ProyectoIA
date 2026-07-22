import {
  BrainCircuit,
  Database,
  FileImage,
  Info,
  Layers3,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getAboutInformation } from "../services/api";

function AboutPanel() {
  const [information, setInformation] =
    useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInformation() {
      try {
        const response =
          await getAboutInformation();

        setInformation(response);
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    loadInformation();
  }, []);

  return (
    <section className="information-panel">
      <div className="about-heading">
        <div className="about-icon">
          <Info size={30} />
        </div>

        <div>
          <h2>Acerca de Fashion AI</h2>

          <p>
            Clasificación de prendas mediante
            inteligencia artificial.
          </p>
        </div>
      </div>

      {error && (
        <div className="panel-error">{error}</div>
      )}

      <div className="about-grid">
        <article className="about-card">
          <BrainCircuit size={28} />

          <h3>Modelo</h3>

          <p>Red neuronal convolucional con TensorFlow.</p>
        </article>

        <article className="about-card">
          <Database size={28} />

          <h3>Dataset</h3>

          <p>
            {information?.dataset || "Fashion-MNIST"}
          </p>
        </article>

        <article className="about-card">
          <Layers3 size={28} />

          <h3>Clases disponibles</h3>

          <p>
            {information?.classes?.length || 10} clases de
            prendas.
          </p>
        </article>

        <article className="about-card">
          <FileImage size={28} />

          <h3>Imágenes permitidas</h3>

          <p>JPG, PNG y WEBP de hasta 5 MB.</p>
        </article>
      </div>

      <div className="classes-container">
        <h3>Prendas reconocidas</h3>

        <div className="classes-list">
          {(
            information?.classes || [
              "Camiseta",
              "Pantalón",
              "Suéter",
              "Vestido",
              "Abrigo",
              "Sandalia",
              "Camisa",
              "Zapatilla",
              "Bolso",
              "Bota",
            ]
          ).map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      <div className="limitations-box">
        <strong>Importante</strong>

        <p>
          {information?.limitations ||
            "El modelo fue entrenado con el conjunto de datos Fashion-MNIST, compuesto por imágenes en escala de grises de 28 × 28 píxeles. Por este motivo, las fotografías reales a color pueden presentar una menor precisión en la clasificación."}
        </p>
      </div>
    </section>
  );
}

export default AboutPanel;