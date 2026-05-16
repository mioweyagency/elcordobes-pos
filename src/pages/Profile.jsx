import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/profile.css";

export default function Profile({ goTo }) {

  /* STORE SETTINGS */

  const savedSettings =
    JSON.parse(

      localStorage.getItem(
        "storeSettings"
      )

    ) || {};

  /* BRAND */

  const [shopName, setShopName] =
    useState(
      savedSettings.shopName || ""
    );

  /* BRANCH */

  const [branchName, setBranchName] =
    useState(

      localStorage.getItem(
        "activeBranch"
      ) || ""

    );

  /* LOGO */

  const [logo, setLogo] =
    useState(
      savedSettings.logo || ""
    );

  /* OWNER */

  const [ownerName, setOwnerName] =
    useState(
      savedSettings.ownerName || ""
    );

  /* TEAM */

  const [teamSize, setTeamSize] =
    useState(
      savedSettings.teamSize || ""
    );

  /* ADDRESS */

  const [shopAddress,
    setShopAddress] =
    useState(
      savedSettings.shopAddress || ""
    );

  /* SAVE */

  const saveSettings = () => {

    const settings = {

      ...savedSettings,

      shopName,

      branchName,

      logo,

      ownerName,

      teamSize,

      shopAddress
    };

    /* SAVE STORE */

    localStorage.setItem(

      "storeSettings",

      JSON.stringify(
        settings
      )

    );

    /* SAVE BRANCH */

    localStorage.setItem(

      "activeBranch",

      branchName

    );

    alert(
      "Profile Updated"
    );

    /* GO HOME */

    goTo("home");
  };

  /* REMOVE LOGO */

  const removeLogo = () => {

    setLogo("");
  };

  return (

    <div className="dashboard-layout">

      <Sidebar
        goTo={goTo}
        active="profile"
      />

      <main className="dashboard-main">

        <Topbar
          title="Profile"
          subtitle="SHOP SETTINGS"
        />

        <div className="profile-container">

          {/* HEADER */}

          <div className="profile-header">

            <h2>
              Coffee Shop Branding
            </h2>

            <p>
              Customize your coffee shop,
              branding, logo and business
              settings for your POS
              system.
            </p>

          </div>

          {/* LOGO */}

          <div className="profile-logo-section">

            {logo ? (

              <img
                src={logo}

                alt="Logo"

                className="profile-logo-preview"
              />

            ) : (

              <div
                className="profile-logo-preview"

                style={{
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontSize:"24px",
                  fontWeight:"800",
                  color:"#777"
                }}
              >

                No Logo

              </div>

            )}

            <div className="profile-logo-actions">

              {/* UPLOAD */}

              <label
                className="upload-image-btn"
              >

                Upload Shop Logo

                <input
                  type="file"

                  hidden

                  accept="image/*"

                  onChange={(e) => {

                    const file =
                      e.target.files[0];

                    if (!file) return;

                    const reader =
                      new FileReader();

                    reader.onload =
                      (event) => {

                      const img =
                        new Image();

                      img.onload =
                        () => {

                        const canvas =
                          document.createElement(
                            "canvas"
                          );

                        const MAX_WIDTH =
                          500;

                        const scaleSize =
                          MAX_WIDTH /
                          img.width;

                        canvas.width =
                          MAX_WIDTH;

                        canvas.height =
                          img.height *
                          scaleSize;

                        const ctx =
                          canvas.getContext(
                            "2d"
                          );

                        ctx.drawImage(

                          img,

                          0,
                          0,

                          canvas.width,
                          canvas.height
                        );

                        const compressed =
                          canvas.toDataURL(

                            "image/jpeg",

                            0.6
                          );

                        setLogo(
                          compressed
                        );

                      };

                      img.src =
                        event.target.result;

                    };

                    reader.readAsDataURL(
                      file
                    );

                  }}
                />

              </label>

              {/* REMOVE */}

              <button
                className="remove-logo-btn"

                onClick={removeLogo}
              >

                Remove Logo

              </button>

            </div>

          </div>

          {/* FORM */}

          <div className="profile-form">

            {/* BRAND */}

            <div>

              <p className="profile-label">
                Brand Name
              </p>

              <input
                type="text"

                placeholder="El Cordobés Coffee"

                value={shopName}

                onChange={(e) =>
                  setShopName(
                    e.target.value
                  )
                }

                className="profile-input"
              />

            </div>

            {/* BRANCH */}

            <div>

              <p className="profile-label">
                Active Branch
              </p>

              <input
                type="text"

                placeholder="Roma Norte"

                value={branchName}

                onChange={(e) =>
                  setBranchName(
                    e.target.value
                  )
                }

                className="profile-input"
              />

            </div>

            {/* OWNER */}

            <div>

              <p className="profile-label">
                Owner / Manager
              </p>

              <input
                type="text"

                placeholder="David Beristain"

                value={ownerName}

                onChange={(e) =>
                  setOwnerName(
                    e.target.value
                  )
                }

                className="profile-input"
              />

            </div>

            {/* TEAM */}

            <div>

              <p className="profile-label">
                Team Size
              </p>

              <input
                type="text"

                placeholder="6 Employees"

                value={teamSize}

                onChange={(e) =>
                  setTeamSize(
                    e.target.value
                  )
                }

                className="profile-input"
              />

            </div>

            {/* ADDRESS */}

            <div>

              <p className="profile-label">
                Coffee Shop Address
              </p>

              <input
                type="text"

                placeholder="Mexico City"

                value={shopAddress}

                onChange={(e) =>
                  setShopAddress(
                    e.target.value
                  )
                }

                className="profile-input"
              />

            </div>

            {/* SAVE */}

            <button
              className="save-btn"

              onClick={saveSettings}
            >

              Save Shop Settings

            </button>

          </div>

        </div>

      </main>

    </div>

  );
}