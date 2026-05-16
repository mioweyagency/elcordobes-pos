import { useState } from "react";

import "../styles/employeeselect.css";

import heroImage
  from "../assets/cordobespos.png";

import EditEmployeeModal
  from "../components/EditEmployeeModal";

export default function EmployeeSelect({ goTo }) {

  /* EMPLOYEES */

  const [employees, setEmployees] =
    useState(

      JSON.parse(
        localStorage.getItem(
          "employees"
        )
      ) || []

    );

  /* FORM */

  const [employeeName,
    setEmployeeName] =
    useState("");

  const [employeeRole,
    setEmployeeRole] =
    useState("");

  const [employeeShift,
    setEmployeeShift] =
    useState("");

  const [employeePhoto,
    setEmployeePhoto] =
    useState("");

  /* ACTIVE EMPLOYEE */

  const [selectedEmployee,
    setSelectedEmployee] =
    useState(null);

  /* MODAL */

  const [showEditModal,
    setShowEditModal] =
    useState(false);

  /* DEFAULT AVATARS */

  const defaultAvatars = [

    "/avatars/avatar1.png",

    "/avatars/avatar2.png",

    "/avatars/avatar3.png",

    "/avatars/avatar4.png"

  ];

  /* SELECT AVATAR */

  const selectAvatar =
    (avatar) => {

    setEmployeePhoto(
      avatar
    );
  };

  /* ADD EMPLOYEE */

  const addEmployee = () => {

    if (
      !employeeName ||
      !employeeRole
    ) return;

    const updatedEmployees = [

      ...employees,

      {
        id: Date.now(),

        name: employeeName,

        role: employeeRole,

        shift: employeeShift,

        photo:
          employeePhoto ||

          "/avatars/avatar1.png"
      }

    ];

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

    /* RESET */

    setEmployeeName("");

    setEmployeeRole("");

    setEmployeeShift("");

    setEmployeePhoto("");
  };

  /* DELETE EMPLOYEE */

  const deleteEmployee =
    (employeeId) => {

    const updatedEmployees =
      employees.filter(

        (employee) =>

          employee.id !==
          employeeId

      );

    setEmployees(
      updatedEmployees
    );

    localStorage.setItem(

      "employees",

      JSON.stringify(
        updatedEmployees
      )

    );

    /* RESET */

    if (
      selectedEmployee?.id ===
      employeeId
    ) {

      setSelectedEmployee(
        null
      );
    }
  };

  /* CHECK IN */

  const checkInEmployee =
    () => {

    if (!selectedEmployee)
      return;

    const activeEmployee = {

      ...selectedEmployee,

      checkIn:
        new Date()
          .toLocaleTimeString(),

      checkInDate:
        new Date()
          .toLocaleDateString(),

      active:true
    };

    /* SAVE ACTIVE */

    localStorage.setItem(

      "activeEmployee",

      JSON.stringify(
        activeEmployee
      )

    );

    /* SAVE HISTORY */

    const history =

      JSON.parse(

        localStorage.getItem(
          "employeeHistory"
        )

      ) || [];

    history.push({

      ...activeEmployee,

      checkOut:null,

      hoursWorked:null
    });

    localStorage.setItem(

      "employeeHistory",

      JSON.stringify(
        history
      )

    );

    goTo("home");
  };

  return (

    <div className="employee-page">

      {/* LEFT SIDE */}

      <section className="employee-left">

        <img
          src={heroImage}

          alt="Coffee"

          className="employee-bg"
        />

        <div className="employee-overlay" />

        <div className="employee-left-content">

          <p>
            EL CORDOBÉS POS
          </p>

          <h1>

            Team
            <br />
            Management

          </h1>

          <span>

            Manage employees,
            shifts and daily
            café operations.

          </span>

        </div>

      </section>

      {/* RIGHT SIDE */}

      <section className="employee-right">

        <div className="employee-card">

          <p className="employee-label">

            STAFF MANAGEMENT

          </p>

          <h2>
            Employees
          </h2>

          {/* FORM */}

          <div className="employee-form">

            {/* NAME */}

            <input
              type="text"

              placeholder="Employee Name"

              value={employeeName}

              onChange={(e) =>
                setEmployeeName(
                  e.target.value
                )
              }

              className="employee-input"
            />

            {/* ROLE */}

            <input
              type="text"

              placeholder="Role"

              value={employeeRole}

              onChange={(e) =>
                setEmployeeRole(
                  e.target.value
                )
              }

              className="employee-input"
            />

            {/* SHIFT */}

            <input
              type="text"

              placeholder="Shift"

              value={employeeShift}

              onChange={(e) =>
                setEmployeeShift(
                  e.target.value
                )
              }

              className="employee-input"
            />

            {/* AVATAR GRID */}

            <div className="avatar-grid">

              {defaultAvatars.map(
                (avatar, index) => (

                <button
                  key={index}

                  type="button"

                  className={

                    employeePhoto === avatar

                      ? "avatar-btn active"

                      : "avatar-btn"
                  }

                  onClick={() =>
                    selectAvatar(
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

            <label className="upload-photo-btn">

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

                    const img =
                      new Image();

                    img.onload =
                      () => {

                      const canvas =
                        document.createElement(
                          "canvas"
                        );

                      const MAX_WIDTH =
                        400;

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

                      setEmployeePhoto(
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

            {/* PREVIEW */}

            {employeePhoto && (

              <img
                src={employeePhoto}

                alt="Preview"

                className="employee-preview"
              />

            )}

            {/* ADD */}

            <button
              className="add-employee-btn"

              onClick={addEmployee}
            >

              Add Employee

            </button>

          </div>

          {/* EMPTY */}

          {employees.length === 0 && (

            <div className="empty-employees">

              No employees yet

            </div>

          )}

          {/* EMPLOYEE LIST */}

          <div className="employee-users">

            {employees.map((employee) => (

              <div
                key={employee.id}

                className="employee-user-wrapper"
              >

                {/* CARD */}

                <button
                  className={

                    selectedEmployee?.id ===
                    employee.id

                      ? "employee-user active"

                      : "employee-user"
                  }

                  onClick={() => {

                    setSelectedEmployee(
                      employee
                    );
                  }}
                >

                  <img
                    src={employee.photo}

                    alt={employee.name}
                  />

                  <div>

                    <h3>
                      {employee.name}
                    </h3>

                    <p>
                      {employee.role}
                    </p>

                    <span>
                      {employee.shift}
                    </span>

                  </div>

                </button>

                {/* EDIT */}

                <button
                  className="edit-employee-btn"

                  onClick={() => {

                    setSelectedEmployee(
                      employee
                    );

                    setShowEditModal(
                      true
                    );
                  }}
                >

                  Edit Employee

                </button>

                {/* DELETE */}

                <button
                  className="delete-employee-btn"

                  onClick={() =>
                    deleteEmployee(
                      employee.id
                    )
                  }
                >

                  Remove Employee

                </button>

              </div>

            ))}

          </div>

          {/* CHECK IN */}

          <button
            className="employee-button"

            disabled={!selectedEmployee}

            onClick={
              checkInEmployee
            }
          >

            Check In

          </button>

        </div>

      </section>

      {/* MODAL */}

      {showEditModal && (

        <EditEmployeeModal

          employee={
            selectedEmployee
          }

          employees={employees}

          setEmployees={
            setEmployees
          }

          onClose={() =>
            setShowEditModal(
              false
            )
          }
        />

      )}

    </div>

  );
}