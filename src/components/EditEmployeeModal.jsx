import { useState } from "react";

import "../styles/editEmployeeModal.css";

export default function EditEmployeeModal({

  employee,

  employees,

  setEmployees,

  onClose

}) {

  /* STATES */

  const [name, setName] =
    useState(
      employee?.name || ""
    );

  const [role, setRole] =
    useState(
      employee?.role || ""
    );

  const [shift, setShift] =
    useState(
      employee?.shift || ""
    );

  const [photo, setPhoto] =
    useState(
      employee?.photo || ""
    );

  /* DEFAULT AVATARS */

  const defaultAvatars = [

    "/avatars/avatar1.png",

    "/avatars/avatar2.png",

    "/avatars/avatar3.png",

    "/avatars/avatar4.png"

  ];

  /* SAVE */

  const saveChanges = () => {

    const updatedEmployees =
      employees.map(
        (item) => {

        if (
          item.id === employee.id
        ) {

          return {

            ...item,

            name,

            role,

            shift,

            photo
          };
        }

        return item;
      });

    /* SAVE */

    setEmployees(
      updatedEmployees
    );

    localStorage.setItem(

      "employees",

      JSON.stringify(
        updatedEmployees
      )

    );

    /* CLOSE */

    onClose();
  };

  return (

    <div className="edit-modal-overlay">

      <div className="edit-modal">

        {/* HEADER */}

        <div className="edit-header">

          <div>

            <p>
              EMPLOYEE SETTINGS
            </p>

            <h2>
              Edit Employee
            </h2>

          </div>

          <button
            className="close-modal-btn"

            onClick={onClose}
          >

            ✕

          </button>

        </div>

        {/* PREVIEW */}

        <div className="edit-avatar-preview">

          <img
            src={photo}

            alt="Employee"
          />

        </div>

        {/* INPUTS */}

        <div className="edit-inputs">

          <input
            type="text"

            placeholder="Employee Name"

            value={name}

            onChange={(e) =>
              setName(
                e.target.value
              )
            }
          />

          <input
            type="text"

            placeholder="Role"

            value={role}

            onChange={(e) =>
              setRole(
                e.target.value
              )
            }
          />

          <input
            type="text"

            placeholder="Shift"

            value={shift}

            onChange={(e) =>
              setShift(
                e.target.value
              )
            }
          />

        </div>

        {/* AVATARS */}

        <div className="edit-avatar-grid">

          {defaultAvatars.map(
            (avatar, index) => (

            <button
              key={index}

              className={

                photo === avatar

                  ? "edit-avatar-btn active"

                  : "edit-avatar-btn"
              }

              onClick={() =>
                setPhoto(
                  avatar
                )
              }
            >

              <img
                src={avatar}

                alt="Avatar"
              />

            </button>

          ))}

        </div>

        {/* CUSTOM PHOTO */}

        <label className="edit-upload-btn">

          Upload Custom Photo

          <input
            type="file"

            hidden

            accept="image/*"

            onChange={(e) => {

              const file =
                e.target.files[0];

              if (!file)
                return;

              const reader =
                new FileReader();

              reader.onload =
                (event) => {

                setPhoto(
                  event.target.result
                );
              };

              reader.readAsDataURL(
                file
              );
            }}
          />

        </label>

        {/* ACTIONS */}

        <div className="edit-actions">

          <button
            className="cancel-btn"

            onClick={onClose}
          >

            Cancel

          </button>

          <button
            className="save-btn"

            onClick={saveChanges}
          >

            Save Changes

          </button>

        </div>

      </div>

    </div>

  );
}