import { useState, useReducer, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, actionTypes } from "../../script/AuthContext";
import "./index.css";

import Button from "../../component/button";
import Title from "../../component/title";
import Field from "../../component/field";
import FieldPassword from "../../component/field-password";
import BackButton from "../../component/back-button";

import { useParams } from "react-router-dom";

const initialState = {
  code: "",
  password: "",
};

interface State {
  code: string;
  password: string;
}

type Action =
  | { type: "SET_CODE"; payload: string }
  | { type: "SET_PASSWORD"; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_CODE":
      return { ...state, code: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    default:
      return state;
  }
};

const RecoveryConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch: authDispatch } = useContext(AuthContext);

  const [errorData, setErrorData] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleContinue = async () => {
    try {
      const res = await fetch(
        "https://povshy.github.io/pov24/recovery-confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: state.code,
            password: state.password,
            id: id,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        setErrorData(errorData.message);
        throw new Error(errorData.message);
      }

      const data = await res.json();
      console.log(data);

      authDispatch({
        type: actionTypes.LOGIN,
        payload: {
          token: data.session.token,
          user: data.session.user,
        },
      });

      localStorage.setItem("token", data.session.token);
      localStorage.setItem("user", JSON.stringify(data.session.user));

      navigate(`/balance/${data.id}`);
    } catch (error: any) {
      setErrorData(error.message);
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <BackButton />
      <div className="signup-page">
        <Title
          title="Recover password"
          description="Choose a recovery method"
        />
        <div className="field-block">
          <Field
            type="number"
            placeholder="Enter your code ..."
            value={state.code}
            onChange={(e) =>
              dispatch({ type: "SET_CODE", payload: e.target.value })
            }
            label="Code:"
          />

          <FieldPassword
            type="password"
            placeholder="Enter your new password ..."
            value={state.password}
            onChange={(e) =>
              dispatch({ type: "SET_PASSWORD", payload: e.target.value })
            }
            label="New password:"
          />
        </div>
        <div>
          <Button onClick={handleContinue} text="Restore password" dark />
          {errorData ? <p className="error-message">{errorData}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default RecoveryConfirmPage;
