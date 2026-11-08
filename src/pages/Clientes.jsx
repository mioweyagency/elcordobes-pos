import { useState } from "react";

import { useTranslation } from "react-i18next";

import Sidebar from "../components/Sidebar";

import "../styles/clientes.css";

import CoriAcademy from "../components/CoriAcademy";

export default function Clientes({ goTo }) {

  const { i18n } = useTranslation();

  const es = (

    i18n.resolvedLanguage ||

    i18n.language ||

    "es"

  ).startsWith("es");

  const text = (spanish, english) =>

    es ? spanish : english;

  const [search, setSearch] = useState("");

  const [customers, setCustomers] = useState(() => {

    try {

      const saved = JSON.parse(

        localStorage.getItem("cori_loyalty_customers") || "[]"

      );

      return Array.isArray(saved) ? saved : [];

    } catch {

      return [];

    }

  });

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const filteredCustomers = customers.filter((customer) => {

    const query = search.trim().toLowerCase();

    return (

      customer.name.toLowerCase().includes(query) ||

      customer.phone.includes(query)

    );

  });

  const totalPoints = customers.reduce(

    (total, customer) => total + customer.points,

    0

  );

  const vipCustomers = customers.filter(

    (customer) => customer.visits >= 10

  ).length;

  function addCustomer(event) {

    event.preventDefault();

    const cleanName = name.trim();

    const cleanPhone = phone.trim();

    if (!cleanName || !cleanPhone) {

      return;

    }

    const exists = customers.some(

      (customer) => customer.phone === cleanPhone

    );

    if (exists) {

      alert(

        text(

          "Ya existe un cliente con este teléfono.",

          "A customer with this phone number already exists."

        )

      );

      return;

    }

    const customer = {

      id: crypto.randomUUID(),

      name: cleanName,

      phone: cleanPhone,

      points: 0,

      visits: 0,

      totalSpent: 0,

      createdAt: new Date().toISOString(),

    };

    const updated = [customer, ...customers];

    setCustomers(updated);

    localStorage.setItem(

      "cori_loyalty_customers",

      JSON.stringify(updated)

    );

    setName("");

    setPhone("");

    setShowForm(false);

  }

  return (

    <div className="cl-layout">

      <Sidebar goTo={goTo} active="clientes" />

      <main className="cl-main">

        <div className="cl-heading">

          <div>

            <span className="cl-eyebrow">

              CORI LOYALTY

            </span>

            <h1>

              {text("Clientes frecuentes", "Loyal Customers")}

            </h1>

            <p>

              {text(

                "Construye relaciones, recompensa visitas y haz crecer tu cafetería.",

                "Build relationships, reward visits and grow your coffee shop."

              )}

            </p>

          </div>

          <button

            type="button"

            className="cl-primary-button"

            onClick={() => setShowForm(true)}

          >

            \+ {text("Nuevo cliente", "New customer")}

          </button>

        </div>

{/* =====================================================

    CORI ACADEMY — CLIENTES FRECUENTES

\===================================================== */}

<section className="cl-academy-section">

  <CoriAcademy

    title={text("¡Hola! Soy Cori.", "Hi! I'm Cori.")}

    description={text(

      "Aprende a registrar clientes, consultar sus puntos y conocer a tus clientes VIP.",

      "Learn how to register customers, check loyalty points, and identify your VIP customers."

    )}

    videoSrc={`${import.meta.env.BASE_URL}videos/cori_greeting_and_guiding_29857_Seedance_25.mp4`}

  />

</section>

{/* =====================================================

    ESTADÍSTICAS — CORI LOYALTY

\===================================================== */}

<section className="cl-stats"></section>

        <section className="cl-stats">

          <article className="cl-stat-card">

            <span>

              {text("Clientes registrados", "Registered customers")}

            </span>

            <strong>{customers.length}</strong>

            <small>CORI LOYALTY</small>

          </article>

          <article className="cl-stat-card">

            <span>

              {text("Clientes VIP", "VIP customers")}

            </span>

            <strong>{vipCustomers}</strong>

            <small>

              {text("10 visitas o más", "10 visits or more")}

            </small>

          </article>

          <article className="cl-stat-card">

            <span>

              {text("Puntos disponibles", "Available points")}

            </span>

            <strong>{totalPoints}</strong>

            <small>

              {text("Saldo acumulado", "Accumulated balance")}

            </small>

          </article>

        </section>

        <section className="cl-customers-panel">

          <div className="cl-panel-header">

            <div>

              <h2>

                {text("Directorio de clientes", "Customer directory")}

              </h2>

              <p>

                {text(

                  "Consulta tus clientes y sus recompensas.",

                  "View your customers and their rewards."

                )}

              </p>

            </div>

            <input

              type="search"

              value={search}

              onChange={(event) => setSearch(event.target.value)}

              placeholder={text(

                "Buscar por nombre o teléfono...",

                "Search by name or phone..."

              )}

              aria-label={text("Buscar clientes", "Search customers")}

            />

          </div>

          <div className="cl-table-scroll">

            <table className="cl-table">

              <thead>

                <tr>

                  <th>{text("Cliente", "Customer")}</th>

                  <th>{text("Teléfono", "Phone")}</th>

                  <th>{text("Visitas", "Visits")}</th>

                  <th>{text("Puntos", "Points")}</th>

                  <th>{text("Nivel", "Level")}</th>

                </tr>

              </thead>

              <tbody>

                {filteredCustomers.map((customer) => (

                  <tr key={customer.id}>

                    <td>

                      <div className="cl-customer-name">

                        <span className="cl-avatar">

                          {customer.name.charAt(0).toUpperCase()}

                        </span>

                        <strong>{customer.name}</strong>

                      </div>

                    </td>

                    <td>{customer.phone}</td>

                    <td>{customer.visits}</td>

                    <td>

                      <span className="cl-points">

                        ✦ {customer.points}

                      </span>

                    </td>

                    <td>

                      <span className="cl-level">

                        {customer.visits >= 10

                          ? "VIP"

                          : text("Regular", "Regular")}

                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {filteredCustomers.length === 0 && (

              <div className="cl-empty">

                <span>✦</span>

                <h3>

                  {customers.length === 0

                    ? text(

                        "Tu comunidad comienza aquí",

                        "Your community starts here"

                      )

                    : text(

                        "No encontramos clientes",

                        "No customers found"

                      )}

                </h3>

                <p>

                  {customers.length === 0

                    ? text(

                        "Registra tu primer cliente para comenzar Cori Loyalty.",

                        "Register your first customer to start Cori Loyalty."

                      )

                    : text(

                        "Prueba con otro nombre o teléfono.",

                        "Try another name or phone number."

                      )}

                </p>

              </div>

            )}

          </div>

        </section>

      </main>

      {showForm && (

        <div

          className="cl-modal-backdrop"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) {

              setShowForm(false);

            }

          }}

        >

          <div

            className="cl-modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="cl-modal-title"

          >

            <span className="cl-eyebrow">CORI LOYALTY</span>

            <h2 id="cl-modal-title">

              {text("Registrar cliente", "Register customer")}

            </h2>

            <p>

              {text(

                "Agrega un cliente a tu comunidad.",

                "Add a customer to your community."

              )}

            </p>

            <form onSubmit={addCustomer}>

              <label>

                {text("Nombre completo", "Full name")}

                <input

                  value={name}

                  onChange={(event) => setName(event.target.value)}

                  placeholder={text(

                    "Nombre del cliente",

                    "Customer name"

                  )}

                  maxLength={100}

                  required

                />

              </label>

              <label>

                {text("Teléfono", "Phone")}

                <input

                  type="tel"

                  value={phone}

                  onChange={(event) => setPhone(event.target.value)}

                  placeholder="55 1234 5678"

                  maxLength={25}

                  required

                />

              </label>

              <div className="cl-modal-actions">

                <button

                  type="button"

                  className="cl-secondary-button"

                  onClick={() => setShowForm(false)}

                >

                  {text("Cancelar", "Cancel")}

                </button>

                <button

                  type="submit"

                  className="cl-primary-button"

                >

                  {text("Guardar cliente", "Save customer")}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}
