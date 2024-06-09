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
};

interface State {
  email: string;
  password: string;
}

type Action =
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PASSWORD"; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    default:
      return state;
  }
};

const SigninPage: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch: authDispatch } = useContext(AuthContext);

  const [errorData, setErrorData] = useState<string | null>(null);

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleContinue = async () => {
    try {
      const res = await fetch("https://povshy.github.io/pov24/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: state.email,
          password: state.password,
        }),
      });

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
        <Title title="Sign In" description="Select login method" />
        <div className="field-block">
          <Field
            type="email"
            placeholder="Enter your email ..."
            value={state.email}
            onChange={(e) =>
              dispatch({ type: "SET_EMAIL", payload: e.target.value })
            }
            label="Email:"
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
          <span>
            Forgot your password? <a href="/recovery">Restore</a>
          </span>
        </div>
        <div>
          <Button onClick={handleContinue} text="Continue" dark />
          {errorData ? <p className="error-message">{errorData}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
