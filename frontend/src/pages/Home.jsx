import {
    AlertCircle,
    LockKeyhole,
    ScanSearch,
} from "lucide-react";
import { useEffect, useState } from "react";

import AboutPanel from "../components/AboutPanel";
import Header from "../components/Header";
import HistoryPanel from "../components/HistoryPanel";
import ImagePreview from "../components/ImagePreview";
import ResultCard from "../components/ResultCard";
import UploadArea from "../components/UploadArea";
import TrainingPanel from "../components/TrainingPanel";

import {
    getModelStatus,
    predictGarment,
} from "../services/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

function Home({
    activeSection,
    darkMode,
    onToggleTheme,
    onOpenSidebar,
}) {
    const [selectedFile, setSelectedFile] =
        useState(null);

    const [preview, setPreview] = useState("");

    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [modelReady, setModelReady] =
        useState(null);

    useEffect(() => {
        async function checkModel() {
            try {
                const response = await getModelStatus();

                setModelReady(
                    Boolean(response.ready_for_predictions)
                );
            } catch {
                setModelReady(false);
            }
        }

        checkModel();
    }, []);

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const resetAnalysis = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setSelectedFile(null);
        setPreview("");
        setResult(null);
        setError("");
    };

    const handleFileSelected = (file) => {
        setError("");
        setResult(null);

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError(
                "Formato no permitido. Selecciona una imagen JPG, PNG o WEBP."
            );

            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(
                "La imagen supera el tamaño máximo de 5 MB."
            );

            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handlePredict = async () => {
        if (!selectedFile) {
            setError(
                "Selecciona una imagen antes de realizar el análisis."
            );

            return;
        }

        if (!modelReady) {
            setError(
                "El modelo no está disponible. Comunícate con el administrador."
            );

            return;
        }

        try {
            setLoading(true);
            setError("");
            setResult(null);

            const response = await predictGarment(
                selectedFile
            );

            setResult(response);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    let title = "Clasificador de Prendas";
    let subtitle =
        "Sube una imagen y descubre qué prenda es";

    if (activeSection === "training") {
        title = "Entrenamiento";
        subtitle =
            "Consulta las métricas y parámetros del modelo";
    }

    if (activeSection === "history") {
        title = "Historial";
        subtitle =
            "Consulta las clasificaciones realizadas";
    }

    if (activeSection === "about") {
        title = "Acerca de";
        subtitle =
            "Conoce cómo funciona esta aplicación";
    }

    return (
        <main className="main-content">
            <Header
                title={title}
                subtitle={subtitle}
                darkMode={darkMode}
                onToggleTheme={onToggleTheme}
                onOpenSidebar={onOpenSidebar}
            />

            {activeSection === "classify" && (
                <div className="classification-content">
                    {modelReady === false && (
                        <div className="model-warning">
                            <AlertCircle size={21} />

                            <div>
                                <strong>
                                    Modelo no disponible
                                </strong>

                                <p>
                                    El modelo debe estar entrenado antes de
                                    realizar predicciones.
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="request-error">
                            <AlertCircle size={21} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="classification-grid">
                        <section className="upload-card">
                            <UploadArea
                                onFileSelected={handleFileSelected}
                                disabled={loading}
                            />

                            <div className="preview-heading">
                                <h3>Vista previa</h3>
                            </div>

                            <ImagePreview
                                preview={preview}
                                filename={selectedFile?.name}
                                onRemove={resetAnalysis}
                            />

                            <button
                                type="button"
                                className="analyze-button"
                                onClick={handlePredict}
                                disabled={
                                    loading ||
                                    !selectedFile ||
                                    modelReady === false
                                }
                            >
                                <ScanSearch size={21} />

                                {loading
                                    ? "Analizando..."
                                    : "Analizar prenda"}
                            </button>

                            <div className="privacy-message">
                                <LockKeyhole size={17} />

                                <span>
                                    Tus imágenes se eliminan después del
                                    análisis.
                                </span>
                            </div>
                        </section>

                        <ResultCard
                            result={result}
                            loading={loading}
                            preview={preview}
                            onReset={resetAnalysis}
                        />
                    </div>
                </div>
            )}

            {activeSection === "training" && (
                <TrainingPanel />
            )}
            
            {activeSection === "history" && (
                <HistoryPanel />
            )}

            {activeSection === "about" && (
                <AboutPanel />
            )}
        </main>
    );
}

export default Home;