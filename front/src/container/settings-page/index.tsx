import { useState, useReducer, useContext } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { AuthContext, actionTypes } from "../../script/AuthContext";

import Button from "../../component/button";
import Title from "../../component/title";
import Field from "../../component/field";
import FieldPassword from "../../component/field-password";
import BackButton from "../../component/back-button";

const initialState = {
  email: "",
  password: "",
  oldPassword: "",
  newPassword: "",
};

interface State {
  email: string;
  password: string;
  oldPassword: string;
  newPassword: string;
}

type Action =
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_OLD_PASSWORD"; payload: string }
  | { type: "SET_NEW_PASSWORD"; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_OLD_PASSWORD":
      return { ...state, oldPassword: action.payload };
    case "SET_NEW_PASSWORD":
      return { ...state, newPassword: action.payload };
    default:
      return state;
  }
};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch: authDispatch } = useContext(AuthContext);

  const [errorData, setErrorData] = useState<string | null>(null);

  const [state, dispatch] = useReducer(reducer, initialState);
  // -------------------------------------
  const handleEmailChange = async () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("Користувача не знайдено");
      }
      const user = JSON.parse(userString);

      const res = await fetch(`https://povshy.github.io/pov24/change-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          email: state.email,
          password: state.password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }

      const data = await res.json();

      // Оновлення email в локальному сховищі та контексті
      user.email = state.email;
      localStorage.setItem("user", JSON.stringify(user));

      authDispatch({
        type: actionTypes.LOGIN,
        payload: {
          token: localStorage.getItem("token"),
          user,
        },
      });

      dispatch({ type: "SET_EMAIL", payload: "" });
      dispatch({ type: "SET_PASSWORD", payload: "" });

      setErrorData(null);
      alert(data.message);
    } catch (error: any) {
      setErrorData(error.message);
    }
  };
  // -------------------------------------
  const handlePasswordChange = async () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("Користувача не знайдено");
      }
      const user = JSON.parse(userString);

      const res = await fetch(
        `https://povshy.github.io/pov24/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user.id,
            oldPassword: state.oldPassword,
            newPassword: state.newPassword,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }

      const data = await res.json();

      dispatch({ type: "SET_OLD_PASSWORD", payload: "" });
      dispatch({ type: "SET_NEW_PASSWORD", payload: "" });
      setErrorData(null);
      alert(data.message);
    } catch (error: any) {
      setErrorData(error.message);
    }
  };
  // -------------------------------------
  const handleLogout = () => {
    authDispatch({ type: actionTypes.LOGOUT });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };
  // -------------------------------------

  return (
    <div>
      <BackButton />
      <div className="setting-page">
        <Title title="Settings" />
        <div className="setting-block">
          <h2>Change email</h2>
          <Field
            type="email"
            placeholder="Enter your email ..."
            value={state.email}
            onChange={(e) =>
              dispatch({ type: "SET_EMAIL", payload: e.target.value })
            }
            label="New Email:"
          />

          <FieldPassword
            type="password"
            placeholder="Enter your password ..."
            value={state.password}
            onChange={(e) =>
              dispatch({ type: "SET_PASSWORD", payload: e.target.value })
            }
            label="Password:"
          />
          <div>
            <Button onClick={handleEmailChange} text="Save Email" />
          </div>
        </div>
        {/* ------------------ */}
        <hr />

        <div className="setting-block">
          <h2>Change Password</h2>
          <FieldPassword
            type="password"
            placeholder="Enter your old email ..."
            value={state.oldPassword}
            onChange={(e) =>
              dispatch({ type: "SET_OLD_PASSWORD", payload: e.target.value })
            }
            label="Old Password:"
          />

          <FieldPassword
            type="password"
            placeholder="Enter your password ..."
            value={state.newPassword}
            onChange={(e) =>
              dispatch({ type: "SET_NEW_PASSWORD", payload: e.target.value })
            }
            label="New Password:"
          />
          <div>
            <Button onClick={handlePasswordChange} text="Save Password" />
          </div>
          <hr />

          <div>
            <Button
              onClick={handleLogout}
              text="Log out"
              style={{ border: "1px solid red", color: "red" }}
            />
          </div>
        </div>
        {errorData && <p className="error-message">{errorData}</p>}
      </div>
    </div>
  );
};

export default SettingsPage;
