import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import {
  formatMoney,
  priceCents,
} from "./posUtils";

export async function createReceiptPdf(
  sale,
  settings = {}
) {
  const pdf = await PDFDocument.create();

  const regular = await pdf.embedFont(
    StandardFonts.Helvetica
  );

  const bold = await pdf.embedFont(
    StandardFonts.HelveticaBold
  );

  const width = 226.77;
  const height = 600;
  const margin = 16;

  const ink = rgb(0.13, 0.13, 0.12);
  const olive = rgb(0.31, 0.40, 0.22);

  const supported = new Set(
    regular.getCharacterSet()
  );

  const shop =
    settings.shopName || "El Cordobés";

  let page;
  let y;

  function clean(value) {
    return Array.from(
      String(value ?? "").replace(/\s+/g, " ")
    )
      .map((char) =>
        supported.has(char.codePointAt(0))
          ? char
          : "?"
      )
      .join("");
  }

  function addPage() {
    page = pdf.addPage([width, height]);
    y = height - margin - 12;
  }

  function ensure(space = 15) {
    if (y - space < margin + 12) {
      addPage();
    }
  }

  function wrap(value, maxWidth, font, size) {
    const lines = [];
    let line = "";

    for (const char of clean(value)) {
      const candidate = line + char;

      if (
        line &&
        font.widthOfTextAtSize(candidate, size) >
          maxWidth
      ) {
        lines.push(line.trimEnd());
        line = char === " " ? "" : char;
      } else {
        line = candidate;
      }
    }

    if (line || !lines.length) {
      lines.push(line.trimEnd());
    }

    return lines;
  }

  function text(
    value,
    font = regular,
    size = 9,
    center = false
  ) {
    const lines = wrap(
      value,
      width - margin * 2,
      font,
      size
    );

    for (const line of lines) {
      ensure(size + 5);

      page.drawText(line, {
        x: center
          ? (
              width -
              font.widthOfTextAtSize(line, size)
            ) / 2
          : margin,
        y,
        size,
        font,
        color: ink,
      });

      y -= size + 5;
    }
  }

  function divider() {
    ensure(12);

    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 0.5,
      color: olive,
    });

    y -= 12;
  }

  function row(label, value, strong = false) {
    const font = strong ? bold : regular;
    const size = strong ? 11 : 9;

    const right = clean(value);

    const rightWidth =
      font.widthOfTextAtSize(right, size);

    const availableWidth = Math.max(
      25,
      width - margin * 2 - rightWidth - 10
    );

    const lines = wrap(
      label,
      availableWidth,
      font,
      size
    );

    ensure((size + 5) * lines.length);

    for (let index = 0; index < lines.length; index++) {
      page.drawText(lines[index], {
        x: margin,
        y,
        size,
        font,
        color: ink,
      });

      if (index === 0) {
        page.drawText(right, {
          x: width - margin - rightWidth,
          y,
          size,
          font,
          color: ink,
        });
      }

      y -= size + 5;
    }
  }

  addPage();

  pdf.setTitle(
    `Recibo ${sale.orderNumber} - ${shop}`
  );

  pdf.setAuthor(shop);

  // BRAND

  text("✦", bold, 14, true);

  text(
    shop.toUpperCase(),
    bold,
    15,
    true
  );

  text(
    "COFFEE & BAKERY",
    regular,
    8,
    true
  );

  y -= 8;

  divider();

  text(
    "RECIBO DE VENTA",
    bold,
    9,
    true
  );

  text(
    `ORDEN #${sale.orderNumber}`,
    bold,
    10,
    true
  );

  text(
    new Date(sale.date).toLocaleString("es-MX"),
    regular,
    8,
    true
  );

  if (settings.shopAddress) {
    text(
      settings.shopAddress,
      regular,
      8,
      true
    );
  }

  divider();

  // CUSTOMER

  text(
    `Cliente: ${sale.customerName || "Cliente"}`
  );

  text(
    `Mesa: ${sale.tableNumber || "-"}`
  );

  if (sale.branch) {
    text(`Sucursal: ${sale.branch}`);
  }

  const payments = {
    Card: "Tarjeta",
    Cash: "Efectivo",
    Transferencia: "Transferencia",
    QR: "QR",
  };

  text(
    `Pago: ${
      payments[sale.paymentMethod] ||
      sale.paymentMethod ||
      "-"
    }`
  );

  divider();

  // PRODUCTS

  text(
    "DETALLE DEL PEDIDO",
    bold,
    9
  );

  y -= 6;

  for (const item of sale.items || []) {
    text(item.name, bold);

    row(
      `${item.quantity} x ${formatMoney(item.price)}`,
      formatMoney(
        (
          priceCents(item.price) *
          item.quantity
        ) / 100
      )
    );

    y -= 4;
  }

  divider();

  // TOTALS

  const discount =
    Number(sale.discountAmount) || 0;

  const hasDiscount = discount > 0;

  if (
    hasDiscount &&
    sale.originalTotal != null
  ) {
    row(
      "Importe original",
      formatMoney(sale.originalTotal)
    );
  }

  row(
    "Subtotal",
    formatMoney(sale.subtotal)
  );

  row(
    "IVA incluido 16%",
    formatMoney(sale.iva)
  );

  if (hasDiscount) {
    row(
      sale.discountLabel || "Descuento",
      `-${formatMoney(discount)}`
    );
  }

  y -= 8;

  divider();

  row(
    "TOTAL MXN",
    formatMoney(sale.total),
    true
  );

  divider();

  // CORI LOYALTY

  if (sale.loyaltyCustomerId) {
    text(
      "CORI LOYALTY",
      bold,
      10,
      true
    );

    y -= 5;

    row(
      "Puntos ganados",
      `+${sale.loyaltyPointsEarned || 0}`
    );

    if (sale.loyaltyPointsBalance != null) {
      row(
        "Saldo de puntos",
        String(sale.loyaltyPointsBalance)
      );
    }

    if (sale.loyaltyRewardAvailable) {
      y -= 5;

      text(
        "META DE PUNTOS ALCANZADA",
        bold,
        8,
        true
      );
    }

    divider();
  }

  // FOOTER

  text(
    "GRACIAS POR TU VISITA",
    bold,
    10,
    true
  );

  text(
    "Buen cafe. Mejores historias.",
    regular,
    8,
    true
  );

  y -= 8;

  text(
    "EL CORDOBES",
    bold,
    9,
    true
  );

  text(
    "Powered by Cori POS",
    regular,
    7,
    true
  );

  text(
    "Recibo de venta. No es factura fiscal.",
    regular,
    7,
    true
  );

  const bytes = await pdf.save();

  const order = String(sale.orderNumber)
    .replace(/[^a-zA-Z0-9-]/g, "")
    .slice(0, 48);

  return new File(
    [new Uint8Array(bytes).buffer],
    `Recibo-${order || "venta"}.pdf`,
    {
      type: "application/pdf",
    }
  );
}