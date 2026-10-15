export function priceNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .replace(/[^0-9.-]/g, "");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

export function priceCents(value) {
  return Math.round(priceNumber(value) * 100);
}

export function formatMoney(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceNumber(value));
}

export function readArray(key) {
  const raw = localStorage.getItem(key);

  if (!raw) return [];

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`Los datos de "${key}" no tienen el formato esperado.`);
  }

  return parsed;
}

export function normalizeCart(items) {
  if (!Array.isArray(items)) return [];

  const result = [];

  for (const item of items) {
    if (!item || item.id == null) continue;

    const quantity = Math.max(
      1,
      Math.floor(Number(item.quantity) || 1)
    );

    const existing = result.find(
      (entry) => entry.id === item.id
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      result.push({
        ...item,
        quantity,
      });
    }
  }

  return result;
}