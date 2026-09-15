const API_URL = "/api/clientes";

const state = {
  clientes: [],
  query: "",
  editingId: null
};

const elements = {
  form: document.querySelector("#clienteForm"),
  formTitle: document.querySelector("#form-title"),
  clienteId: document.querySelector("#clienteId"),
  nombre: document.querySelector("#nombre"),
  email: document.querySelector("#email"),
  telefono: document.querySelector("#telefono"),
  direccion: document.querySelector("#direccion"),
  submitButton: document.querySelector("#submitButton"),
  resetButton: document.querySelector("#resetButton"),
  refreshButton: document.querySelector("#refreshButton"),
  searchInput: document.querySelector("#searchInput"),
  clientesBody: document.querySelector("#clientesBody"),
  emptyState: document.querySelector("#emptyState"),
  statusText: document.querySelector("#statusText"),
  countBadge: document.querySelector("#countBadge"),
  metricTotal: document.querySelector("#metricTotal"),
  metricEmails: document.querySelector("#metricEmails"),
  metricPhones: document.querySelector("#metricPhones"),
  toast: document.querySelector("#toast")
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  elements.form.addEventListener("submit", saveCliente);
  elements.resetButton.addEventListener("click", resetForm);
  elements.refreshButton.addEventListener("click", loadClientes);
  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderClientes();
  });

  loadClientes();
});

async function loadClientes() {
  setStatus("Cargando clientes...");
  setButtonLoading(elements.refreshButton, true);

  try {
    const response = await fetch(API_URL);
    await ensureOk(response);
    state.clientes = await response.json();
    renderClientes();
    setStatus("Lista actualizada");
  } catch (error) {
    showToast(error.message, true);
    setStatus("No se pudo cargar la lista");
  } finally {
    setButtonLoading(elements.refreshButton, false);
  }
}

async function saveCliente(event) {
  event.preventDefault();

  const payload = {
    nombre: elements.nombre.value.trim(),
    email: elements.email.value.trim(),
    telefono: elements.telefono.value.trim(),
    direccion: elements.direccion.value.trim()
  };

  if (!payload.nombre || !payload.email) {
    showToast("Nombre y email son obligatorios.", true);
    return;
  }

  const isEditing = Boolean(state.editingId);
  const url = isEditing ? `${API_URL}/${state.editingId}` : API_URL;
  const method = isEditing ? "PUT" : "POST";

  setButtonLoading(elements.submitButton, true);

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    await ensureOk(response);
    resetForm();
    await loadClientes();
    showToast(isEditing ? "Cliente actualizado." : "Cliente creado.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setButtonLoading(elements.submitButton, false);
  }
}

async function deleteCliente(id) {
  const cliente = state.clientes.find((item) => item.id === id);
  const label = cliente ? cliente.nombre : `ID ${id}`;

  if (!window.confirm(`Eliminar cliente ${label}?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    await ensureOk(response);
    if (state.editingId === id) {
      resetForm();
    }
    await loadClientes();
    showToast("Cliente eliminado.");
  } catch (error) {
    showToast(error.message, true);
  }
}

function editCliente(id) {
  const cliente = state.clientes.find((item) => item.id === id);
  if (!cliente) {
    return;
  }

  state.editingId = id;
  elements.clienteId.value = cliente.id;
  elements.nombre.value = cliente.nombre || "";
  elements.email.value = cliente.email || "";
  elements.telefono.value = cliente.telefono || "";
  elements.direccion.value = cliente.direccion || "";
  elements.formTitle.textContent = "Editar cliente";
  elements.submitButton.innerHTML = '<i data-lucide="save"></i> Actualizar cliente';
  window.lucide?.createIcons();
  elements.nombre.focus();
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  elements.clienteId.value = "";
  elements.formTitle.textContent = "Nuevo cliente";
  elements.submitButton.innerHTML = '<i data-lucide="save"></i> Guardar cliente';
  window.lucide?.createIcons();
}

function renderClientes() {
  const clientes = state.clientes.filter((cliente) => {
    const text = `${cliente.nombre || ""} ${cliente.email || ""} ${cliente.telefono || ""} ${cliente.direccion || ""}`.toLowerCase();
    return text.includes(state.query);
  });

  elements.countBadge.textContent = String(clientes.length);
  renderMetrics(clientes);
  elements.emptyState.hidden = clientes.length > 0;
  elements.clientesBody.innerHTML = clientes.map(clienteRow).join("");

  elements.clientesBody.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => editCliente(Number(button.dataset.edit)));
  });

  elements.clientesBody.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteCliente(Number(button.dataset.delete)));
  });

  window.lucide?.createIcons();
}

function renderMetrics(clientes) {
  elements.metricTotal.textContent = String(clientes.length);
  elements.metricEmails.textContent = String(clientes.filter((cliente) => cliente.email).length);
  elements.metricPhones.textContent = String(clientes.filter((cliente) => cliente.telefono).length);
}

function clienteRow(cliente) {
  return `
    <tr>
      <td>${escapeHtml(cliente.nombre)}</td>
      <td>${escapeHtml(cliente.email)}</td>
      <td>${escapeHtml(cliente.telefono || "-")}</td>
      <td>${escapeHtml(cliente.direccion || "-")}</td>
      <td>
        <div class="actions">
          <button class="icon-button" type="button" data-edit="${cliente.id}" title="Editar" aria-label="Editar ${escapeHtml(cliente.nombre)}">
            <i data-lucide="pencil"></i>
          </button>
          <button class="icon-button danger" type="button" data-delete="${cliente.id}" title="Eliminar" aria-label="Eliminar ${escapeHtml(cliente.nombre)}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

async function ensureOk(response) {
  if (response.ok) {
    return;
  }

  let message = `Error ${response.status}`;

  try {
    const body = await response.json();
    if (body.fields) {
      message = Object.values(body.fields).join(" ");
    } else if (body.message) {
      message = body.message;
    }
  } catch (_error) {
    message = response.statusText || message;
  }

  throw new Error(message);
}

function setStatus(message) {
  elements.statusText.textContent = message;
}

function setButtonLoading(button, loading) {
  button.disabled = loading;
  button.style.opacity = loading ? "0.7" : "1";
}

function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.hidden = false;

  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 3200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
