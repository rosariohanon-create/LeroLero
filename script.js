const products = window.LERO_PRODUCTS || [];
const grid = document.getElementById("productGrid");
const resultsCount = document.getElementById("resultsCount");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filterButtons = document.querySelectorAll(".filter-btn");
const modal = document.getElementById("productModal");

let activeCategory = "Todas";

function formatProductTitle(product) {
  const material = (product.material || "").replace(/\s+/g, " ").trim();
  if (!material) return product.name || product.category;
  return `${product.category} en ${material.length > 52 ? material.slice(0, 52) + "…" : material}`;
}

function productMatches(product) {
  const query = searchInput.value.trim().toLowerCase();
  const categoryOk = activeCategory === "Todas" || product.category === activeCategory;
  const haystack = [
    product.id,
    product.category,
    product.material,
    product.price_display,
    product.sheet
  ].join(" ").toLowerCase();
  return categoryOk && (!query || haystack.includes(query));
}

function sortProducts(items) {
  const sorted = [...items];
  const mode = sortSelect.value;
  if (mode === "price-asc") sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  if (mode === "price-desc") sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  if (mode === "category") sorted.sort((a, b) => `${a.category}${a.id}`.localeCompare(`${b.category}${b.id}`));
  return sorted;
}

function renderProducts() {
  const visible = sortProducts(products.filter(productMatches));
  resultsCount.textContent = `${visible.length} producto${visible.length === 1 ? "" : "s"} encontrados`;
  grid.innerHTML = visible.map(product => {
    const image = product.image ? `images/${product.image}` : "";
    const title = formatProductTitle(product);
    const material = product.material || "Material según catálogo.";
    return `
      <article class="product-card">
        <div class="product-media" onclick="openProduct('${product.id}')">
          ${image ? `<img loading="lazy" src="${image}" alt="${escapeHtml(title)}">` : `<div class="image-placeholder">Sin imagen</div>`}
          <span class="badge">${escapeHtml(product.category)}</span>
        </div>
        <div class="product-info">
          <div class="product-category">${escapeHtml(product.id)} · ${escapeHtml(product.category)}</div>
          <h3 class="product-title">${escapeHtml(title)}</h3>
          <p class="product-material">${escapeHtml(material)}</p>
          <div class="product-bottom">
            <span class="price">${escapeHtml(product.price_display || "Consultar")}</span>
            <button class="view-btn" onclick="openProduct('${product.id}')">Ver</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, function(match) {
    return ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[match];
  });
}

function openProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const title = formatProductTitle(product);
  document.getElementById("modalImage").src = product.image ? `images/${product.image}` : "";
  document.getElementById("modalImage").alt = title;
  document.getElementById("modalCategory").textContent = `${product.category} · ${product.id}`;
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalMaterial").textContent = product.material ? `Material: ${product.material}` : "Material según catálogo.";
  document.getElementById("modalPrice").textContent = product.price_display || "Consultar";
  document.getElementById("modalCode").textContent = `Código: ${product.id} · Fila Excel: ${product.sheet} ${product.row}`;
  const message = encodeURIComponent(`Hola, quiero consultar por ${product.id}: ${title} (${product.price_display || "precio por consultar"}).`);
  document.getElementById("whatsappLink").href = `https://wa.me/?text=${message}`;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    activeCategory = button.dataset.category;
    renderProducts();
  });
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

renderProducts();
