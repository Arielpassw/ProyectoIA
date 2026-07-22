import { X } from "lucide-react";

function ImagePreview({
  preview,
  filename,
  onRemove,
}) {
  if (!preview) {
    return (
      <div className="empty-preview">
        <p>La imagen seleccionada aparecerá aquí.</p>
      </div>
    );
  }

  return (
    <div className="image-preview">
      <img
        src={preview}
        alt={`Vista previa de ${filename}`}
      />

      <button
        type="button"
        className="remove-image-button"
        onClick={onRemove}
        aria-label="Eliminar imagen"
      >
        <X size={21} />
      </button>
    </div>
  );
}

export default ImagePreview;