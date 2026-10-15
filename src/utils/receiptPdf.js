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

  const width = 226.77; // 80 mm
  const height = 600;
  const margin = 16;

  const ink = rgb(0.16, 0.12, 0.08);
  const olive = rgb(0.2, 0.22, 0.12);

  const supported = new Set(
    regular.getCharacterSet()
  );

  const shop = settings.shopName || "El Cordobés";

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
    const rightWidth = font.widthOfTextAtSize(
      right,
      size
    );

    const lines = wrap(
      label,
      width - margin * 2 - rightWidth - 10,
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

  text(shop, bold, 15, true);
  text("RECIBO DE VENTA", regular, 9, true);

  if (settings.shopAddress) {
    text(settings.shopAddress, regular, 8, true);
  }

  divider();

  text(`Orden #${sale.orderNumber}`, bold);

  text(
    new Date(sale.date).toLocaleString("es-MX")
  );

  if (sale.branch) {
    text(`Sucursal: ${sale.branch}`);
  }

  text(`Cliente: ${sale.customerName || "Cliente"}`);
  text(`Mesa: ${sale.tableNumber || "-"}`);

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

  for (const item of sale.items || []) {
    text(item.name, bold);

    row(
      `${item.quantity} x ${formatMoney(item.price)}`,
      formatMoney(
        priceCents(item.price) *
          item.quantity /
          100
      )
    );

    y -= 4;
  }

  ensure(95);
  divider();

  row("Subtotal", formatMoney(sale.subtotal));
  row("IVA incluido 16%", formatMoney(sale.iva));
  row("TOTAL MXN", formatMoney(sale.total), true);

  divider();

  text("Gracias por tu visita.", regular, 9, true);
  text(
    "Buen café. Mejores historias.",
    regular,
    8,
    true
  );

  text(
    "Contacto: +52 55 4382 3213",
    regular,
    8,
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
    { type: "application/pdf" }
  );
}