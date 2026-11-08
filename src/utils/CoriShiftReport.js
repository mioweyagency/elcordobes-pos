/* CORI POS — bilingual closed-shift reports.
   Read-only: never changes sales or sessions.
*/

const money = (amount) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(amount) || 0);

const pesos = (cents) => (Number(cents) || 0) / 100;

const dateText = (date, es) => {
  if (!date) return "—";

  const value = new Date(date);

  return Number.isNaN(value.getTime())
    ? "—"
    : value.toLocaleString(es ? "es-MX" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

export function getShiftReport(session, es = true) {
  if (!session || session.status !== "closed") {
    throw new Error(
      es
        ? "Solo se pueden compartir turnos cerrados."
        : "Only closed shifts can be shared."
    );
  }

  const s = session.closingSummary || {};

  const row = (english, spanish, value) => ({
    label: es ? spanish : english,
    value,
  });

  return {
    title: es
      ? "REPORTE DE CIERRE DE CAJA"
      : "REGISTER CLOSING REPORT",

    filename: `Cori_Shift_${String(session.id || "closed")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 32)}.pdf`,

    rows: [
      row(
        "Branch",
        "Sucursal",
        session.branchName || session.branchId || "—"
      ),

      row("Register", "Caja", session.registerId || "—"),

      row("Employee", "Empleado", session.employeeName || "—"),

      row(
        "Closed by",
        "Cerrada por",
        session.closedByEmployeeName ||
          session.closedBy ||
          "—"
      ),

      row(
        "Opened at",
        "Apertura",
        dateText(session.openedAt, es)
      ),

      row(
        "Closed at",
        "Cierre",
        dateText(session.closedAt, es)
      ),

      row(
        "Orders",
        "Pedidos",
        String(s.orderCount ?? "—")
      ),

      row(
        "Opening balance",
        "Fondo inicial",
        money(pesos(session.openingAmount))
      ),

      row(
        "Cash sales",
        "Ventas en efectivo",
        s.cashSales == null ? "—" : money(s.cashSales)
      ),

      row(
        "Card sales",
        "Ventas con tarjeta",
        s.cardSales == null ? "—" : money(s.cardSales)
      ),

      row(
        "Other payments",
        "Otros pagos",
        s.otherSales == null ? "—" : money(s.otherSales)
      ),

      row(
        "Total sales",
        "Ventas totales",
        s.totalSales == null ? "—" : money(s.totalSales)
      ),

      row(
        "Cash in",
        "Entradas de efectivo",
        s.cashIn == null ? "—" : money(s.cashIn)
      ),

      row(
        "Cash out",
        "Salidas de efectivo",
        s.cashOut == null ? "—" : money(s.cashOut)
      ),

      row(
        "Expected cash",
        "Efectivo esperado",
        session.expectedCashAtClose == null
          ? "—"
          : money(pesos(session.expectedCashAtClose))
      ),

      row(
        "Counted cash",
        "Efectivo contado",
        session.countedCash == null
          ? "—"
          : money(pesos(session.countedCash))
      ),

      row(
        "Difference (over / short)",
        "Diferencia (sobrante / faltante)",
        money(
          pesos(
            session.cashDifference ??
              session.differenceCents
          )
        )
      ),

      row(
        "Closing notes",
        "Notas de cierre",
        session.closingNotes || "—"
      ),
    ],
  };
}

// ==========================================
// TEXT REPORT
// ==========================================

export function getShiftReportText(session, es = true) {
  const report = getShiftReport(session, es);

  return [
    "EL CORDOBÉS — CORI POS",
    report.title,
    "",
    ...report.rows.map(
      ({ label, value }) => `${label}: ${value}`
    ),
  ].join("\n");
}

// ==========================================
// DOWNLOAD PDF
// ==========================================

export async function downloadShiftReportPdf(
  session,
  es = true
) {
  const { jsPDF } = await import("jspdf");

  const report = getShiftReport(session, es);

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  // Header
  pdf.setFillColor(20, 29, 23);
  pdf.rect(0, 0, 210, 48, "F");

  pdf.setTextColor(190, 218, 139);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);

  pdf.text(
    "EL CORDOBES  |  CORI POS",
    16,
    22
  );

  pdf.setTextColor(245, 245, 239);
  pdf.setFontSize(11);

  pdf.text(
    es
      ? "REPORTE DE CIERRE DE CAJA"
      : "REGISTER CLOSING REPORT",
    16,
    34
  );

  let y = 60;

  for (const { label, value } of report.rows) {
    const labelLines = pdf.splitTextToSize(
      label,
      76
    );

    const valueLines = pdf.splitTextToSize(
      String(value),
      100
    );

    const lineCount = Math.max(
      labelLines.length,
      valueLines.length
    );

    if (y + lineCount * 6 > 276) {
      pdf.addPage();
      y = 22;
    }

    pdf.setFontSize(10);

    pdf.setTextColor(90, 99, 89);
    pdf.setFont("helvetica", "normal");

    pdf.text(labelLines, 16, y);

    pdf.setTextColor(32, 41, 32);
    pdf.setFont("helvetica", "bold");

    pdf.text(valueLines, 98, y);

    y += Math.max(
      9,
      lineCount * 6 + 3
    );

    pdf.setDrawColor(228, 232, 225);

    pdf.line(
      16,
      y - 3,
      194,
      y - 3
    );
  }

  pdf.save(report.filename);
}

// ==========================================
// SEND EMAIL
// ==========================================

export function emailShiftReport(
  session,
  es = true
) {
  const subject = es
    ? "El Cordobés — Cierre de caja"
    : "El Cordobés — Register closing";

  const body = getShiftReportText(
    session,
    es
  );

  window.location.href =
    `mailto:?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;
}

// ==========================================
// SHARE WHATSAPP
// ==========================================

export function whatsappShiftReport(
  session,
  es = true
) {
  const body = getShiftReportText(
    session,
    es
  );

  window.open(
    `https://wa.me/?text=${encodeURIComponent(body)}`,
    "_blank",
    "noopener,noreferrer"
  );
}