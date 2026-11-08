import { useCallback, useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import { useTranslation } from "react-i18next";

import {

  getActiveBranch,

  getActiveEmployee,

  getActiveCashSession,

  openCashRegister,

  calculateCashSummary,

  closeCashRegister,

  readCashSessions,

} from "../utils/coriCashControl";

import { downloadShiftReportPdf, emailShiftReport, whatsappShiftReport } from "../utils/coriShiftReport";

import "../styles/home.css";

import "../styles/cashControl.css";

const formatMoney = (amount) =>

  new Intl.NumberFormat("es-MX", {

    style: "currency",

    currency: "MXN",

  }).format(Number(amount) || 0);

function readSales() {

  try {

    const data = JSON.parse(localStorage.getItem("sales") || "[]");

    return Array.isArray(data) ? data : [];

  } catch {

    return [];

  }

}

function formatDate(value) {

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("es-MX", {

    dateStyle: "medium",

    timeStyle: "short",

  });

}

export default function CashControl({ goTo }) {

  const { i18n } = useTranslation();

  const es = (i18n.resolvedLanguage || i18n.language || "es").split("-")[0] === "es";

  const tr = (english, spanish) => es ? spanish : english;

  const dateLocale = es ? "es-MX" : "en-US";

  const showDate = (value) => { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString(dateLocale, { dateStyle: "medium", timeStyle: "short" }); };

  const translateError = (message) => {

    if (!es) return message;

    const errors = {

      "This branch already has an open register.": "Esta sucursal ya tiene una caja abierta.",

      "Invalid opening cash amount.": "El fondo inicial no es válido.",

      "Select an employee before opening the register.": "Selecciona un empleado antes de abrir la caja.",

      "Cash register session not found.": "No se encontró la sesión de caja.",

      "This register is already closed.": "Esta caja ya está cerrada.",

      "Unable to read sales. Register was not closed.": "No se pudieron leer las ventas. La caja no se cerró.",

      "Select an employee before closing the register.": "Selecciona un empleado antes de cerrar la caja.",

    };

    return errors[message] || message;

  };

  const [branch, setBranch] = useState(getActiveBranch);

  const [session, setSession] = useState(() =>

    getActiveCashSession()

  );

  const [sales, setSales] = useState(readSales);

  const [employeeName, setEmployeeName] = useState(

    () => getActiveEmployee()?.name || ""

  );

  const [openingAmount, setOpeningAmount] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [countedCash, setCountedCash] = useState("");

  const [closingNotes, setClosingNotes] = useState("");

  const [closingEmployee, setClosingEmployee] = useState("");

  const [confirmClose, setConfirmClose] = useState(false);

  const [history, setHistory] = useState([]);

  const handleReport = async (action, item) => {
    setError("");
    try {
      if (action === "pdf") await downloadShiftReportPdf(item, es);
      if (action === "email") emailShiftReport(item, es);
      if (action === "whatsapp") whatsappShiftReport(item, es);
    } catch (err) {
      console.error("Shift report:", err);
      setError(err?.message || tr("Could not share shift report.", "No se pudo compartir el reporte de turno."));
    }
  };


  const refresh = useCallback(() => {

    const currentBranch = getActiveBranch();

    setBranch(currentBranch);

    setSession(getActiveCashSession(currentBranch));

    setSales(readSales());

    setHistory(readCashSessions().filter(s => s.branchId === currentBranch && s.status === "closed").reverse());

  }, []);

  useEffect(() => {

    refresh();

    // Refreshes the register automatically while this screen is open.

    // The storage event also handles changes from other browser tabs.

    const intervalId = window.setInterval(refresh, 2000);

    window.addEventListener("focus", refresh);

    window.addEventListener("storage", refresh);

    return () => {

      window.clearInterval(intervalId);

      window.removeEventListener("focus", refresh);

      window.removeEventListener("storage", refresh);

    };

  }, [refresh]);

  const summary = calculateCashSummary(session, sales);

  function handleOpenRegister(event) {

    event.preventDefault();

    setError("");

    setSuccess("");

    try {

      const employee = getActiveEmployee();

      const activeEmployee =

        employee?.name?.trim()

          ? employee

          : employeeName.trim();

      if (!activeEmployee) {

        throw new Error(

          tr("Enter the employee name.", "Ingresa el nombre del empleado.")

        );

      }

      const amountText = openingAmount.trim();

      if (

        !/^\d+(\.\d{1,2})?$/.test(amountText)

      ) {

        throw new Error(

          tr("Enter a valid amount with up to two decimals.", "Ingresa un monto válido con máximo dos decimales.")

        );

      }

      const newSession = openCashRegister({

        branch: getActiveBranch(),

        employee: activeEmployee,

        openingAmount: amountText,

      });

      setSession(newSession);

      setOpeningAmount("");

      setSuccess(tr("Register opened successfully.", "Caja abierta correctamente."));

      refresh();

    } catch (err) {

      setError(

        translateError(err.message) || tr("Unable to open the register.", "No se pudo abrir la caja.")

      );

    }

  }

  function handleCloseRegister(event) {

    event.preventDefault();

    setError("");

    setSuccess("");

    if (!session) return;

    if (!confirmClose) {

      setError(tr("Confirm the cash count before closing the register.", "Confirma el conteo antes de cerrar la caja."));

      return;

    }

    try {

      const closing = closeCashRegister({

        sessionId: session.id,

        countedCash,

        employee: closingEmployee.trim() || getActiveEmployee()?.name || session.employeeName,

        notes: closingNotes,

      });

      setSuccess(tr(`Shift closed. Difference: ${formatMoney((closing.cashDifference ?? closing.differenceCents ?? 0) / 100)}. The next employee can open a new register.`, `Turno cerrado. Diferencia: ${formatMoney((closing.cashDifference ?? closing.differenceCents ?? 0) / 100)}. El siguiente empleado puede abrir una nueva caja.`));

      setCountedCash("");

      setClosingNotes("");

      setClosingEmployee("");

      setConfirmClose(false);

      refresh();

    } catch (err) {

      setError(translateError(err.message) || tr("Unable to close the register.", "No se pudo cerrar la caja."));

    }

  }

  return (

    <div className="cori-home cori-cash-page">

      <Sidebar goTo={goTo} active="cashControl" />

      <main className="ch-main cori-cash-main">



        <header className="cash-header">

          <div className="cash-header-copy">

            <p className="cash-eyebrow">

              {tr("CORI POS / CASH MANAGEMENT", "CORI POS / CONTROL DE CAJA")}

            </p>

            <h1 className="cash-title">

              {tr("Cash Control", "Control de Caja")}

            </h1>

            <p className="cash-subtitle">

              {tr("Manage your register, cash movements, and daily closing.", "Administra la caja, los movimientos de efectivo y el cierre diario.")}

            </p>

          </div>

          <span

            className={`cash-status ${

              session ? "is-open" : "is-closed"

            }`}

          >

            {session ? tr("Register Open", "Caja abierta") : tr("Register Closed", "Caja cerrada")}

          </span>

        </header>

        {/* FINANCIAL OVERVIEW */}

        <section className="cash-stats-grid">

          <article className="cash-stat-card is-highlight">

            <span className="cash-stat-label">

              {tr('Opening Balance', 'Fondo inicial')}

            </span>

            <strong className="cash-stat-value">

              {formatMoney(summary.openingBalance)}

            </strong>

            <span className="cash-stat-caption">

              {tr('Starting cash in the drawer', 'Efectivo inicial en caja')}

            </span>

          </article>

          <article className="cash-stat-card">

            <span className="cash-stat-label">

              {tr('Cash Sales', 'Ventas en efectivo')}

            </span>

            <strong className="cash-stat-value">

              {formatMoney(summary.cashSales)}

            </strong>

            <span className="cash-stat-caption">

              {tr('Cash payments received', 'Pagos recibidos en efectivo')}

            </span>

          </article>

          <article className="cash-stat-card">

            <span className="cash-stat-label">

              {tr('Card Sales', 'Ventas con tarjeta')}

            </span>

            <strong className="cash-stat-value">

              {formatMoney(summary.cardSales)}

            </strong>

            <span className="cash-stat-caption">

              {tr('Card payments recorded', 'Pagos con tarjeta registrados')}

            </span>

          </article>

          <article className="cash-stat-card is-highlight">

            <span className="cash-stat-label">

              {tr('Expected Cash', 'Efectivo esperado')}

            </span>

            <strong className="cash-stat-value">

              {formatMoney(summary.expectedCash)}

            </strong>

            <span className="cash-stat-caption">

              {tr('Opening + Cash Sales + Cash In − Cash Out', 'Fondo inicial + Ventas en efectivo + Entradas − Salidas')}

            </span>

          </article>

        </section>

        {/* REGISTER INFORMATION */}

        <section className="cash-content-grid">

          <div className="cash-panel">

            <div className="cash-panel-header">

              <div>

                <h2 className="cash-panel-title">

                  {session ? tr('Active Register', 'Caja activa') : tr('Open Register', 'Abrir caja')}

                </h2>

                <p className="cash-panel-description">

                  {session

                    ? tr('Your register is currently active.', 'Tu caja está abierta actualmente.')

                    : tr('Enter the starting cash to begin your shift.', 'Ingresa el fondo inicial para comenzar tu turno.')}

                </p>

              </div>

            </div>

            {session ? (

              <div className="cash-info-list">

                <div className="cash-info-row">

                  <span>{tr('Branch', 'Sucursal')}</span>

                  <strong>{session.branchName}</strong>

                </div>

                <div className="cash-info-row">

                  <span>{tr('Register', 'Caja')}</span>

                  <strong>{session.registerId}</strong>

                </div>

                <div className="cash-info-row">

                  <span>{tr('Opened By', 'Abierta por')}</span>

                  <strong>{session.employeeName}</strong>

                </div>

                <div className="cash-info-row">

                  <span>{tr('Opened At', 'Fecha de apertura')}</span>

                  <strong>{showDate(session.openedAt)}</strong>

                </div>

                <div className="cash-info-row">

                  <span>{tr('Orders', 'Pedidos')}</span>

                  <strong>{summary.orderCount}</strong>

                </div>

                <div className="cash-info-row is-total">

                  <span>{tr('Expected Cash', 'Efectivo esperado')}</span>

                  <strong>

                    {formatMoney(summary.expectedCash)}

                  </strong>

                </div>

              </div>

            ) : (

              <form

                className="cash-form"

                onSubmit={handleOpenRegister}

              >

                <div className="cash-field">

                  <label htmlFor="cash-branch">

                    {tr('Branch', 'Sucursal')}

                  </label>

                  <input

                    id="cash-branch"

                    className="cash-input"

                    value={branch}

                    readOnly

                  />

                </div>

                <div className="cash-field">

                  <label htmlFor="cash-employee">

                    {tr('Employee Name', 'Nombre del empleado')}

                  </label>

                  <input

                    id="cash-employee"

                    className="cash-input"

                    type="text"

                    value={employeeName}

                    onChange={(event) =>

                      setEmployeeName(event.target.value)

                    }

                    placeholder={tr('Employee name', 'Nombre del empleado')}

                    maxLength={100}

                    required

                  />

                </div>

                <div className="cash-field">

                  <label htmlFor="cash-opening">

                    {tr('Opening Cash (MXN)', 'Fondo inicial (MXN)')}

                  </label>

                  <input

                    id="cash-opening"

                    className="cash-input"

                    type="number"

                    min="0"

                    step="0.01"

                    value={openingAmount}

                    onChange={(event) =>

                      setOpeningAmount(event.target.value)

                    }

                    placeholder="1000.00"

                    required

                  />

                </div>

                <button

                  type="submit"

                  className="cash-button cash-button-primary"

                >

                  {tr('Open Register', 'Abrir caja')} →

                </button>

              </form>

            )}

          </div>

          {/* SESSION SUMMARY */}

          <div className="cash-panel">

            <div className="cash-panel-header">

              <div>

                <h2 className="cash-panel-title">

                  {tr('Register Summary', 'Resumen de caja')}

                </h2>

                <p className="cash-panel-description">

                  {tr('Financial activity for the current session.', 'Actividad financiera del turno actual.')}

                </p>

              </div>

            </div>

            <div className="cash-info-list">

              <div className="cash-info-row">

                <span>{tr('Branch', 'Sucursal')}</span>

                <strong>{branch}</strong>

              </div>

              <div className="cash-info-row">

                <span>{tr('Total Sales', 'Ventas totales')}</span>

                <strong>

                  {formatMoney(summary.totalSales)}

                </strong>

              </div>

              <div className="cash-info-row">

                <span>{tr('Cash In', 'Entrada de efectivo')}</span>

                <strong>

                  {formatMoney(summary.cashIn)}

                </strong>

              </div>

              <div className="cash-info-row">

                <span>{tr('Cash Out', 'Salida de efectivo')}</span>

                <strong>

                  {formatMoney(summary.cashOut)}

                </strong>

              </div>

              <div className="cash-info-row">

                <span>{tr('Other Payments', 'Otros pagos')}</span>

                <strong>

                  {formatMoney(summary.otherSales)}

                </strong>

              </div>

              <div className="cash-info-row is-total">

                <span>{tr('Expected Cash', 'Efectivo esperado')}</span>

                <strong>

                  {formatMoney(summary.expectedCash)}

                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* MOVEMENTS */}

        <section className="cash-panel">

          <div className="cash-panel-header">

            <div>

              <h2 className="cash-panel-title">

                {tr('Cash Movements', 'Movimientos de efectivo')}

              </h2>

              <p className="cash-panel-description">

                {tr('Cash In / Cash Out functionality will be added next.', 'La función de entradas y salidas de efectivo se agregará próximamente.')}

              </p>

            </div>

          </div>

          <div className="cash-empty">

            <strong>{tr('No cash movements yet', 'Aún no hay movimientos de efectivo')}</strong>

            <p>

              {tr('Deposits and withdrawals will appear here.', 'Los depósitos y retiros aparecerán aquí.')}

            </p>

          </div>

        </section>

        {session && (

          <section className="cash-panel" style={{ marginTop: 20 }}>

            <div className="cash-panel-header"><div>

              <h2 className="cash-panel-title">{tr('Close Register / End Shift', 'Cerrar caja / Terminar turno')}</h2>

              <p className="cash-panel-description">{tr('Count the physical cash before the next employee opens a new shift.', 'Cuenta el efectivo antes de que el siguiente empleado abra su turno.')}</p>

            </div></div>

            <form className="cash-form" onSubmit={handleCloseRegister}>

              <div className="cash-info-row"><span>{tr('Expected Cash', 'Efectivo esperado')}</span><strong>{formatMoney(summary.expectedCash)}</strong></div>

              <div className="cash-field">

                <label htmlFor="cash-counted">{tr('Physical Cash Count (MXN)', 'Conteo físico de efectivo (MXN)')}</label>

                <input id="cash-counted" className="cash-input" type="number" min="0" step="0.01" value={countedCash} onChange={e => setCountedCash(e.target.value)} required placeholder={tr('Counted cash in drawer', 'Efectivo contado en caja')} />

              </div>

              {(/^\d+(\.\d{1,2})?$/).test(countedCash) && (

                <div className="cash-info-row is-total"><span>{tr('Difference (Over / Short)', 'Diferencia (Sobrante / Faltante)')}</span>

                  <strong>{formatMoney(Math.round(Number(countedCash) * 100 - summary.expectedCash * 100) / 100)}</strong>

                </div>

              )}

              <div className="cash-field">

                <label htmlFor="cash-closing-employee">{tr('Closing Employee', 'Empleado que cierra')}</label>

                <input id="cash-closing-employee" className="cash-input" value={closingEmployee} onChange={e => setClosingEmployee(e.target.value)} placeholder={getActiveEmployee()?.name || session.employeeName} />

              </div>

              <div className="cash-field">

                <label htmlFor="cash-closing-notes">{tr('Closing Notes (optional)', 'Notas de cierre (opcional)')}</label>

                <input id="cash-closing-notes" className="cash-input" value={closingNotes} onChange={e => setClosingNotes(e.target.value)} placeholder={tr('Reason for any cash difference', 'Motivo de cualquier diferencia de caja')} />

              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0" }}>

                <input type="checkbox" checked={confirmClose} onChange={e => setConfirmClose(e.target.checked)} />

                {tr('I counted the physical cash and confirm this shift is complete.', 'Conté el efectivo físico y confirmo que el turno terminó.')}

              </label>

              <button type="submit" className="cash-button cash-button-primary" disabled={!confirmClose}>{tr('Close Register & Save Shift', 'Cerrar caja y guardar turno')}</button>

            </form>

          </section>

        )}

        <section className="cash-panel" style={{ marginTop: 20 }}>

          <div className="cash-panel-header"><div>

            <h2 className="cash-panel-title">{tr('Shift History', 'Historial de turnos')}</h2>

            <p className="cash-panel-description">{tr('Previous closed registers for this branch.', 'Turnos de caja cerrados en esta sucursal.')}</p>

          </div></div>

          {history.length === 0 ? <div className="cash-empty">{tr('No closed shifts yet.', 'Aún no hay turnos cerrados.')}</div> : (

            <div className="cash-info-list">

              {history.map(item => (

                <div key={item.id} className="cash-info-row" style={{ alignItems: "flex-start", gap: 12 }}>

                  <span>{item.employeeName} · {showDate(item.openedAt)} — {showDate(item.closedAt)}<br />{tr('Closed by: ', 'Cerrada por: ')}{item.closedByEmployeeName || item.closedBy || "—"}</span>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
                    <strong style={{ textAlign: "right" }}>
                      {tr('Counted: ', 'Contado: ')}{formatMoney((item.countedCash || 0) / 100)}
                      <br />{tr('Difference: ', 'Diferencia: ')}{formatMoney((item.cashDifference ?? item.differenceCents ?? 0) / 100)}
                    </strong>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 8 }}>
                      <button type="button" className="cash-button cash-button-secondary" onClick={() => handleReport("pdf", item)}>{tr('Download PDF', 'Descargar PDF')}</button>
                      <button type="button" className="cash-button cash-button-secondary" onClick={() => handleReport("email", item)}>{tr('Send Email', 'Enviar correo')}</button>
                      <button type="button" className="cash-button cash-button-secondary" onClick={() => handleReport("whatsapp", item)}>{tr('WhatsApp', 'WhatsApp')}</button>
                    </div>
                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {(error || success) && (

          <p

            role={error ? "alert" : "status"}

            style={{

              marginTop: 16,

              color: error ? "#ef9b91" : "#b9d58a",

            }}

          >

            {error || success}

          </p>

        )}

        <div style={{ marginTop: 16 }}>

          <button

            type="button"

            className="cash-button cash-button-secondary"

            onClick={refresh}

          >

            {tr('↻ Refresh Register', '↻ Actualizar caja')}

          </button>

        </div>

      </main>

    </div>

  );

}
