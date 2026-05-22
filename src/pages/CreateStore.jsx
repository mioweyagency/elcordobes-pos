import { useState } from "react";

import {
  supabase
} from "../lib/supabase";

import "../styles/createstore.css";

import heroImage
from "../assets/cordobespos.png";

export default function CreateStore({ goTo }) {

  /* =========================================================
     STATES
  ========================================================= */

  const [shopName,
    setShopName] =
    useState("");

  const [ownerName,
    setOwnerName] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [country,
    setCountry] =
    useState("");

  const [currency,
    setCurrency] =
    useState("MXN");

  const [loading,
    setLoading] =
    useState(false);

  /* =========================================================
     CREATE STORE
  ========================================================= */

  const createStore =
    async () => {

    if (
      !shopName ||
      !ownerName ||
      !email ||
      !password
    ) {

      alert(
        "Please complete all fields"
      );

      return;
    }

    setLoading(true);

    /* =========================================================
       SIGN UP
    ========================================================= */

    const {

      data,

      error

    } = await supabase.auth.signUp({

      email,

      password,

      options: {

        data: {

          shop_name:
            shopName,

          owner_name:
            ownerName,

          country,

          currency

        }

      }

    });

    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {

      alert(
        error.message
      );

      setLoading(false);

      return;
    }

    /* =========================================================
       USER ID
    ========================================================= */

    const userId =
      data.user?.id;

    /* =========================================================
       CREATE STORE DATABASE
    ========================================================= */

    if (userId) {

      const {
        error: storeError
      } = await supabase

        .from("stores")

        .insert([{

          user_id:
            userId,

          shop_name:
            shopName,

          owner_name:
            ownerName,

          email,

          country,

          currency

        }]);

      if (storeError) {

        console.log(
          storeError
        );

      }

    }

    /* =========================================================
       EMAIL NOTIFICATION
    ========================================================= */

    try {

      await fetch(

        "https://formsubmit.co/ajax/pos@elcordobescoffee.com",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Accept:
              "application/json"

          },

          body: JSON.stringify({

            shopName,

            ownerName,

            email,

            country,

            currency

          })

        }

      );

    } catch (err) {

      console.log(err);

    }

    /* =========================================================
       SUCCESS
    ========================================================= */

    alert(

      "Store created successfully. Please verify your email."

    );

    setLoading(false);

    goTo("branchSelect");

  };

  return (

    <div className="create-page">

      {/* =========================================================
         LEFT SIDE
      ========================================================= */}

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

      {/* =========================================================
         RIGHT SIDE
      ========================================================= */}

      <section className="create-right">

        <div className="create-card">

          <p className="create-label">

            REGISTER STORE

          </p>

          <h2>
            Create Account
          </h2>

          {/* =========================================================
             INPUTS
          ========================================================= */}

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

          {/* =========================================================
             BUTTON
          ========================================================= */}

          <button
            className="create-button"

            onClick={createStore}

            disabled={loading}
          >

            {
              loading
                ? "Creating..."
                : "Continue"
            }

          </button>

          {/* =========================================================
             LOGIN
          ========================================================= */}

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