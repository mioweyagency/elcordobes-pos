/* =========================================================
   CORI POS — CORI LOYALTY
   El Cordobés Coffee Tech Studio

   10 puntos por cada compra completada
   Recompensa al alcanzar 1000 puntos

   - Registro de puntos
   - Actualización de visitas
   - Gasto acumulado
   - Protección contra puntos duplicados
   - Recuperación de ventas pendientes
========================================================= */

const CUSTOMERS_KEY = "cori_loyalty_customers";
const SALES_KEY = "sales";

export const POINTS_PER_PURCHASE = 10;
export const LOYALTY_REWARD_GOAL = 1000;

/* =========================================================
   STORAGE HELPERS
========================================================= */

function readStorageArray(key) {
  const raw = localStorage.getItem(key);

  if (raw === null) {
    return [];
  }

  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error(`Datos inválidos en ${key}`);
  }

  return data;
}

function saveStorageArray(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* =========================================================
   READ CUSTOMERS
========================================================= */

export function readLoyaltyCustomers() {
  return readStorageArray(CUSTOMERS_KEY);
}

/* =========================================================
   CALCULATE POINTS

   Cada compra completada = 10 puntos

   $40 MXN  = 10 puntos
   $100 MXN = 10 puntos
   $500 MXN = 10 puntos
========================================================= */

export function calculateLoyaltyPoints(amount) {
  const purchaseAmount = Number(amount);

  if (
    !Number.isFinite(purchaseAmount) ||
    purchaseAmount <= 0
  ) {
    return 0;
  }

  return POINTS_PER_PURCHASE;
}

/* =========================================================
   REWARD PROGRESS
========================================================= */

export function getLoyaltyProgress(points = 0) {
  const currentPoints = Math.max(
    0,
    Number(points) || 0
  );

  const rewardsUnlocked = Math.floor(
    currentPoints / LOYALTY_REWARD_GOAL
  );

  const progressPoints =
    currentPoints % LOYALTY_REWARD_GOAL;

  const pointsRemaining =
    currentPoints >= LOYALTY_REWARD_GOAL &&
    progressPoints === 0
      ? 0
      : LOYALTY_REWARD_GOAL - progressPoints;

  const progressPercentage =
    (progressPoints / LOYALTY_REWARD_GOAL) * 100;

  return {
    totalPoints: currentPoints,
    goal: LOYALTY_REWARD_GOAL,
    rewardsUnlocked,
    progressPoints,
    pointsRemaining,
    progressPercentage,
    rewardAvailable: rewardsUnlocked > 0,
  };
}

/* =========================================================
   AWARD LOYALTY POINTS
========================================================= */

export function awardLoyaltyForSale(sale) {
  if (!sale || !sale.id) {
    throw new Error("La venta no tiene un ID válido.");
  }

  const customerId = sale.loyaltyCustomerId;

  if (!customerId) {
    return {
      success: false,
      reason: "no_customer",
      pointsEarned: 0,
    };
  }

  const customers = readLoyaltyCustomers();

  const customerIndex = customers.findIndex(
    (customer) =>
      String(customer.id) === String(customerId)
  );

  if (customerIndex === -1) {
    return {
      success: false,
      reason: "customer_not_found",
      pointsEarned: 0,
    };
  }

  const customer = customers[customerIndex];

  /* =========================================================
     PREVENT DUPLICATE POINTS
  ========================================================= */

  const processedSales = Array.isArray(
    customer.loyaltyProcessedSales
  )
    ? customer.loyaltyProcessedSales
    : [];

  if (processedSales.includes(String(sale.id))) {
    return {
      success: true,
      duplicate: true,
      pointsEarned: 0,
      customer,
    };
  }

  /* =========================================================
     CALCULATE PURCHASE POINTS
  ========================================================= */

  const productTotal = Number(
    sale.productTotal ?? sale.total
  );

  if (
    !Number.isFinite(productTotal) ||
    productTotal <= 0
  ) {
    throw new Error("Total de productos inválido.");
  }

  const pointsEarned =
    calculateLoyaltyPoints(productTotal);

  /* =========================================================
     UPDATE CUSTOMER
  ========================================================= */

  const updatedCustomer = {
    ...customer,

    points:
      (Number(customer.points) || 0) +
      pointsEarned,

    visits:
      (Number(customer.visits) || 0) + 1,

    totalSpent:
      Math.round(
        (
          (Number(customer.totalSpent) || 0) +
          productTotal
        ) * 100
      ) / 100,

    loyaltyProcessedSales: [
      ...processedSales,
      String(sale.id),
    ],

    lastVisit: new Date().toISOString(),
  };

  const updatedCustomers = [...customers];

  updatedCustomers[customerIndex] = updatedCustomer;

  /* SAVE CUSTOMER */

  saveStorageArray(
    CUSTOMERS_KEY,
    updatedCustomers
  );

  /* =========================================================
     REWARD STATUS
  ========================================================= */

  const rewardProgress = getLoyaltyProgress(
    updatedCustomer.points
  );

  return {
    success: true,
    duplicate: false,
    pointsEarned,
    customer: updatedCustomer,
    rewardProgress,
  };
}

/* =========================================================
   RECOVER LOYALTY SALES

   Recupera puntos de ventas registradas
   que todavía no se hayan acreditado.

   No duplica puntos por la misma venta.
========================================================= */

export function recoverLoyaltySales() {
  const sales = readStorageArray(SALES_KEY);

  let recovered = 0;
  let duplicates = 0;
  let pending = 0;

  for (const sale of sales) {
    if (!sale?.loyaltyCustomerId) {
      continue;
    }

    try {
      const result = awardLoyaltyForSale(sale);

      if (result.duplicate) {
        duplicates += 1;
      } else if (result.success) {
        recovered += 1;
      } else {
        pending += 1;
      }
    } catch (error) {
      console.error(
        "Cori Loyalty: error recuperando venta",
        sale.id,
        error
      );

      pending += 1;
    }
  }

  return {
    recovered,
    duplicates,
    pending,
  };
}