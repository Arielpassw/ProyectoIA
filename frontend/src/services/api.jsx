const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

async function handleResponse(response) {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta no válida.");
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        "No se pudo completar la solicitud."
    );
  }

  return data;
}

export async function getModelStatus() {
  const response = await fetch(`${API_URL}/status`);

  return handleResponse(response);
}

export async function predictGarment(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}

export async function getPredictionHistory() {
  const response = await fetch(
    `${API_URL}/predictions/history`
  );

  return handleResponse(response);
}

export async function clearPredictionHistory() {
  const response = await fetch(
    `${API_URL}/predictions/history`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(response);
}

export async function getAboutInformation() {
  const response = await fetch(`${API_URL}/about`);

  return handleResponse(response);
}

export async function getTrainingMetrics() {
  const response = await fetch(`${API_URL}/metrics`);

  return handleResponse(response);
}