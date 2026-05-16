import { useState } from "react";

import "../styles/branchselect.css";

import heroImage
  from "../assets/intro-bg.png";

export default function BranchSelect({ goTo }) {

  /* EXISTING BRANCHES */

  const savedBranches =
    JSON.parse(

      localStorage.getItem(
        "branches"
      )

    ) || [];

  /* STATES */

  const [branches, setBranches] =
    useState(savedBranches);

  const [newBranch, setNewBranch] =
    useState("");

  /* ADD LOCATION */

  const addBranch = () => {

    if (!newBranch.trim())
      return;

    /* PREVENT DUPLICATES */

    const alreadyExists =
      branches.some(

        (branch) =>

          branch.name
            .toLowerCase()

            ===

          newBranch
            .toLowerCase()

      );

    if (alreadyExists) {

      alert(
        "Location already exists"
      );

      return;
    }

    const updatedBranches = [

      ...branches,

      {
        id: Date.now(),

        name: newBranch
      }

    ];

    /* SAVE */

    setBranches(
      updatedBranches
    );

    localStorage.setItem(

      "branches",

      JSON.stringify(
        updatedBranches
      )

    );

    setNewBranch("");
  };

  /* SELECT BRANCH */

  const selectBranch =
    (branch) => {

    localStorage.setItem(

      "activeBranch",

      branch.name

    );

    goTo(
      "employeeSelect"
    );
  };

  /* REMOVE BRANCH */

  const removeBranch =
    (branchId) => {

    const updatedBranches =
      branches.filter(

        (branch) =>

          branch.id !== branchId

      );

    setBranches(
      updatedBranches
    );

    localStorage.setItem(

      "branches",

      JSON.stringify(
        updatedBranches
      )

    );
  };

  return (

    <div className="branch-page">

      {/* LEFT SIDE */}

      <section className="branch-left">

        <img
          src={heroImage}

          alt="Coffee"

          className="branch-bg"
        />

        <div className="branch-overlay" />

        <div className="branch-left-content">

          <p>
            EL CORDOBÉS POS
          </p>

          <h1>

            Select
            <br />
            Location

          </h1>

          <span>

            Manage multiple coffee
            shop locations with a
            modern café operating
            system.

          </span>

        </div>

      </section>

      {/* RIGHT SIDE */}

      <section className="branch-right">

        <div className="branch-card">

          <p className="branch-label">

            MULTI LOCATION SYSTEM

          </p>

          <h2>
            Your Locations
          </h2>

          {/* ADD LOCATION */}

          <div className="branch-add-box">

            <input
              type="text"

              placeholder="Add Location"

              value={newBranch}

              onChange={(e) =>
                setNewBranch(
                  e.target.value
                )
              }

              className="branch-input"
            />

            <button
              className="add-branch-btn"

              onClick={addBranch}
            >

              Add

            </button>

          </div>

          {/* EMPTY */}

          {branches.length === 0 && (

            <div className="empty-branches">

              No locations yet

            </div>

          )}

          {/* BRANCHES */}

          <div className="branch-list">

            {branches.map((branch) => (

              <div
                key={branch.id}

                className="branch-item-wrapper"
              >

                {/* SELECT */}

                <button
                  className="branch-item"

                  onClick={() =>
                    selectBranch(
                      branch
                    )
                  }
                >

                  <div>

                    <h3>
                      {branch.name}
                    </h3>

                    <p>
                      Tap to continue
                    </p>

                  </div>

                </button>

                {/* REMOVE */}

                <button
                  className="remove-branch-btn"

                  onClick={() =>
                    removeBranch(
                      branch.id
                    )
                  }
                >

                  Remove

                </button>

              </div>

            ))}

          </div>

        </div>

      </section>

    </div>

  );
}