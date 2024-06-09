import { useState, useReducer, useContext } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";

import Button from "../../component/button";
import Title from "../../component/title";
import Field from "../../component/field";
import BackButton from "../../component/back-button";

const initialState = {
  email: "",
};

interface State {
  email: string;
}

type Action = { type: "SET_EMAIL"; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    default:
      return state;
  }
};

const RecoveryPage: React.FC = () => {
  const navigate = useNavigate();

  const [errorData, setErrorData] = useState<string | null>(null);

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleContinue = async () => {
    try {
      const res = await fetch("https://povshy.github.io/pov24/recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: state.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrorData(errorData.message);
        throw new Error(errorData.message);
      }

      const data = await res.json();
      console.log(data);
      console.log("Your code:", data.id);

      navigate(`/recovery-confirm/${data.id}`);
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
            type="email"
            placeholder="Enter your email ..."
            value={state.email}
            onChange={(e) =>
              dispatch({ type: "SET_EMAIL", payload: e.target.value })
            }
            label="Email:"
          />
        </div>
        <div>
          <Button onClick={handleContinue} text="Send code" dark />
          {errorData ? <p className="error-message">{errorData}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default RecoveryPage;
