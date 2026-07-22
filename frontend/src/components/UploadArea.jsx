import { ImagePlus, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

function UploadArea({
  onFileSelected,
  disabled,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file) {
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    processFile(file);
  };

  return (
    <div
      className={`upload-area ${
        dragging ? "dragging" : ""
      } ${disabled ? "disabled" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragging(false);
      }}
      onDrop={handleDrop}
      onClick={() => {
        if (!disabled) {
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        disabled={disabled}
        onChange={(event) => {
          processFile(event.target.files?.[0]);

          event.target.value = "";
        }}
      />

      <div className="upload-icon">
        <UploadCloud size={50} />
      </div>

      <h3>
        {dragging
          ? "Suelta la imagen aquí"
          : "Arrastra una imagen aquí"}
      </h3>

      <p>o selecciona un archivo</p>

      <button
        type="button"
        className="select-image-button"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          inputRef.current?.click();
        }}
      >
        <ImagePlus size={19} />
        Seleccionar imagen
      </button>

      <small>
        Formatos permitidos: JPG, PNG y WEBP. Máximo
        5 MB.
      </small>
    </div>
  );
}

export default UploadArea;