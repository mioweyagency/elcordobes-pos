import { useState } from "react";

import "../styles/createstore.css";

import heroImage
  from "../assets/cordobespos.png";

export default function CreateStore({ goTo }) {

  const existingSettings =
    JSON.parse(

      localStorage.getItem(
        "storeSettings"
      )

    ) || {};

  /* STATES */

  const [shopName, setShopName] =
    useState(
      existingSettings.shopName || ""
    );

  const [ownerName, setOwnerName] =
    useState(
      existingSettings.ownerName || ""
    );

  const [email, setEmail] =
    useState(
      existingSettings.email || ""
    );

  const [password, setPassword] =
    useState(
      existingSettings.password || ""
    );

  const [country, setCountry] =
    useState(
      existingSettings.country || ""
    );

  const [currency, setCurrency] =
    useState(
      existingSettings.currency || "MXN"
    );

  /* CREATE STORE */

  const createStore = () => {

    const updatedSettings = {

      ...existingSettings,

      shopName,

      ownerName,

      email,

      password,

      country,

      currency
    };

    localStorage.setItem(

      "storeSettings",

      JSON.stringify(
        updatedSettings
      )

    );

    /* GO TO BRANCH */

    goTo("branchSelect");
  };

  return (

    <div className="create-page">

      {/* LEFT SIDE */}

      <section className="create-left">

        <img
          src={heroImage}

          alt="Coffee"

          className="create-bg"
        />

        <div className="create-overlay" />

        <div className="create-left-content">

          <p>
            EL CORDOBÉS POS
          </p>

          <h1>

            Coffee Shop
            <br />
            Operating System

          </h1>

          <span>

            Minimal Apple-style POS
            built for modern cafés.

          </span>

        </div>

      </section>

      {/* RIGHT SIDE */}

      <section className="create-right">

        <div className="create-card">

          <p className="create-label">

            REGISTER STORE

          </p>

          <h2>
            Create Account
          </h2>

          {/* INPUTS */}

          <div className="create-inputs">

            {/* SHOP */}

            <input
              type="text"

              placeholder="Coffee Shop Name"

              value={shopName}

              onChange={(e) =>
                setShopName(
                  e.target.value
                )
              }
            />

            {/* OWNER */}

            <input
              type="text"

              placeholder="Owner Name"

              value={ownerName}

              onChange={(e) =>
                setOwnerName(
                  e.target.value
                )
              }
            />

            {/* EMAIL */}

            <input
              type="email"

              placeholder="Business Email"

              value={email}

              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

            {/* PASSWORD */}

            <input
              type="password"

              placeholder="Password"

              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

            {/* COUNTRY */}

            <input
              type="text"

              placeholder="Country"

              value={country}

              onChange={(e) =>
                setCountry(
                  e.target.value
                )
              }
            />

            {/* CURRENCY */}

            <select
              value={currency}

              onChange={(e) =>
                setCurrency(
                  e.target.value
                )
              }
            >

              <option>
                MXN
              </option>

              <option>
                USD
              </option>

              <option>
                EUR
              </option>

            </select>

          </div>

          {/* BUTTON */}

          <button
            className="create-button"

            onClick={createStore}
          >

            Continue

          </button>

          {/* LOGIN */}

          <p className="create-login-text">

            Already have an account?

            <span>
              Sign In
            </span>

          </p>

        </div>

      </section>

    </div>

  );
}