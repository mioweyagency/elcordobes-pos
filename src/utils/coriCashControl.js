
/* =====================================================
   CORI POS — CASH CONTROL ENGINE
   El Cordobés Coffee Tech Studio

   Register opening, closing, reconciliation,
   and employee shift history.
===================================================== */

export const CASH_STORAGE_KEY =
  "cori_cash_register_sessions_v1";

/* =====================================================
   BRANCH & EMPLOYEE
===================================================== */

export function getActiveBranch() {
  return (
    localStorage.getItem("activeBranch") ||
    "Main Branch"
  );
}

export function getActiveEmployee() {
  try {
    return JSON.parse(
      localStorage.getItem("activeEmployee") ||
        "null"
    );
  } catch {
    return null;
  }
}

/* =====================================================
   STORAGE
===================================================== */

export function readCashSessions() {
  try {
    const data = JSON.parse(
      localStorage.getItem(CASH_STORAGE_KEY) ||
        "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveCashSessions(sessions) {
  localStorage.setItem(
    CASH_STORAGE_KEY,
    JSON.stringify(sessions)
  );
}

/* =====================================================
   MONEY VALIDATION
   All stored register amounts use cents.
===================================================== */

function parseMoneyToCents(value, label = "Amount") {
  const text = String(value ?? "").trim();

  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    throw new Error(
      `${label} must be a valid amount with up to two decimals.`
    );
  }

  const cents = Math.round(Number(text) * 100);

  if (
    !Number.isSafeInteger(cents) ||
    cents < 0
  ) {
    throw new Error(`Invalid ${label.toLowerCase()}.`);
  }

  return cents;
}

/* =====================================================
   ACTIVE REGISTER
===================================================== */

export function getActiveCashSession(
  branch = getActiveBranch()
) {
  return (
    readCashSessions().find(
      (session) =>
        session.branchId === branch &&
        session.status === "open"
    ) || null
  );
}

/* =====================================================
   OPEN REGISTER
===================================================== */

export function openCashRegister({
  branch = getActiveBranch(),
  employee = getActiveEmployee(),
  openingAmount,
}) {
  const sessions = readCashSessions();

  const alreadyOpen = sessions.some(
    (session) =>
      session.branchId === branch &&
      session.status === "open"
  );

  if (alreadyOpen) {
    throw new Error(
      "This branch already has an open register."
    );
  }

  const amountCents = parseMoneyToCents(
    openingAmount,
    "Opening cash"
  );

  const employeeName =
    typeof employee === "string"
      ? employee.trim()
      : String(employee?.name || "").trim();

  if (!employeeName) {
    throw new Error(
      "Select an employee before opening the register."
    );
  }

  const session = {
    id: crypto.randomUUID(),

    branchId: branch,
    branchName: branch,
    registerId: "register-01",

    employeeId:
      employee &&
      typeof employee === "object"
        ? employee.id ?? null
        : null,

    employeeName,

    openingAmount: amountCents,
    openedAt: new Date().toISOString(),

    status: "open",
    movements: [],
  };

  saveCashSessions([...sessions, session]);

  return session;
}

/* =====================================================
   PAYMENT CLASSIFICATION
===================================================== */

export function getCashPaymentType(method) {
  const value = String(method || "")
    .trim()
    .toLowerCase();

  if (
    value === "cash" ||
    value === "efectivo"
  ) {
    return "cash";
  }

  if (
    value === "card" ||
    value === "tarjeta" ||
    value === "credit" ||
    value === "debit"
  ) {
    return "card";
  }

  return "other";
}

/* =====================================================
   CASH SUMMARY
===================================================== */

export function calculateCashSummary(
  session,
  sales = []
) {
  const emptySummary = {
    openingBalance: 0,
    cashSales: 0,
    cardSales: 0,
    otherSales: 0,
    totalSales: 0,
    cashIn: 0,
    cashOut: 0,
    expectedCash: 0,
    orderCount: 0,
  };

  if (!session) {
    return emptySummary;
  }

  const matchingSales = Array.isArray(sales)
    ? sales.filter(
        (sale) =>
          sale &&
          sale.cashSessionId === session.id &&
          sale.id != null
      )
    : [];

  const uniqueSales = [
    ...new Map(
      matchingSales.map((sale) => [
        String(sale.id),
        sale,
      ])
    ).values(),
  ];

  let cashCents = 0;
  let cardCents = 0;
  let otherCents = 0;
  let orderCount = 0;

  for (const sale of uniqueSales) {
    const amount = Number(sale.total);

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      continue;
    }

    const cents = Math.round(amount * 100);

    if (!Number.isSafeInteger(cents)) {
      continue;
    }

    const paymentType = getCashPaymentType(
      sale.paymentMethod
    );

    if (paymentType === "cash") {
      cashCents += cents;
    } else if (paymentType === "card") {
      cardCents += cents;
    } else {
      otherCents += cents;
    }

    orderCount += 1;
  }

  const movements = Array.isArray(
    session.movements
  )
    ? session.movements
    : [];

  let cashInCents = 0;
  let cashOutCents = 0;

  for (const movement of movements) {
    const cents = Number(
      movement.amountCents
    );

    if (
      !Number.isSafeInteger(cents) ||
      cents <= 0
    ) {
      continue;
    }

    if (movement.type === "in") {
      cashInCents += cents;
    } else if (movement.type === "out") {
      cashOutCents += cents;
    }
  }

  const openingCents =
    Number(session.openingAmount) || 0;

  const expectedCents =
    openingCents +
    cashCents +
    cashInCents -
    cashOutCents;

  return {
    openingBalance: openingCents / 100,
    cashSales: cashCents / 100,
    cardSales: cardCents / 100,
    otherSales: otherCents / 100,

    totalSales:
      (cashCents +
        cardCents +
        otherCents) /
      100,

    cashIn: cashInCents / 100,
    cashOut: cashOutCents / 100,
    expectedCash: expectedCents / 100,
    orderCount,
  };
}

/* =====================================================
   CLOSE REGISTER
   Fresh cash count — Option A
===================================================== */

export function closeCashRegister({
  sessionId,
  countedCash,
  employee = getActiveEmployee(),
  notes = "",
}) {
  const sessions = readCashSessions();

  const index = sessions.findIndex(
    (session) => session.id === sessionId
  );

  if (index === -1) {
    throw new Error(
      "Cash register session not found."
    );
  }

  const session = sessions[index];

  if (session.status !== "open") {
    throw new Error(
      "This register is already closed."
    );
  }

  const countedCashCents = parseMoneyToCents(
    countedCash,
    "Counted cash"
  );

  let sales = [];

  try {
    const storedSales = JSON.parse(
      localStorage.getItem("sales") || "[]"
    );

    if (!Array.isArray(storedSales)) {
      throw new Error("Invalid sales data.");
    }

    sales = storedSales;
  } catch {
    throw new Error(
      "Unable to read sales. Register was not closed."
    );
  }

  const summary = calculateCashSummary(
    session,
    sales
  );

  const expectedCashCents = Math.round(
    summary.expectedCash * 100
  );

  const differenceCents =
    countedCashCents - expectedCashCents;

  const closingEmployeeName =
    typeof employee === "string"
      ? employee.trim()
      : String(employee?.name || "").trim();

  if (!closingEmployeeName) {
    throw new Error(
      "Select an employee before closing the register."
    );
  }

  const closedAt = new Date().toISOString();

  const updatedSession = {
    ...session,

    status: "closed",
    closedAt,

    closedByEmployeeId:
      employee &&
      typeof employee === "object"
        ? employee.id ?? null
        : null,

    closedByEmployeeName:
      closingEmployeeName,

    countedCash: countedCashCents,
    expectedCashAtClose: expectedCashCents,
    cashDifference: differenceCents,

    closingNotes: String(notes || "").trim(),

    closingSummary: {
      ...summary,
    },
  };

  const updatedSessions = [...sessions];

  updatedSessions[index] = updatedSession;

  saveCashSessions(updatedSessions);

  return updatedSession;
}

/* =====================================================
   SHIFT HISTORY
===================================================== */

export function getCashShiftHistory(
  branch = getActiveBranch()
) {
  return readCashSessions()
    .filter(
      (session) =>
        session.branchId === branch
    )
    .sort(
      (a, b) =>
        new Date(b.openedAt).getTime() -
        new Date(a.openedAt).getTime()
    );
}

/* =====================================================
   CLOSED REGISTER SUMMARY
===================================================== */

export function getClosedCashSummary(session) {
  if (
    !session ||
    session.status !== "closed"
  ) {
    return null;
  }

  return {
    employeeName: session.employeeName,
    openedAt: session.openedAt,
    closedAt: session.closedAt,

    openingBalance:
      (Number(session.openingAmount) || 0) /
      100,

    expectedCash:
      (Number(session.expectedCashAtClose) || 0) /
      100,

    countedCash:
      (Number(session.countedCash) || 0) /
      100,

    difference:
      (Number(session.cashDifference) || 0) /
      100,

    summary: session.closingSummary || null,
    notes: session.closingNotes || "",
  };
}
