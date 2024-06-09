import { useState, useReducer, useEffect } from "react";
import "./index.css";
import { roundBalance } from "../../script/utils";

import Title from "../../component/title";
import Field from "../../component/field";
import BackButton from "../../component/back-button";
import Button from "../../component/button";

const initialState = {
  amount: "",
  email: "",
};

interface State {
  amount: string;
  email: string;
}

type Action =
  | { type: "SET_AMOUNT"; payload: string }
  | { type: "SET_EMAIL"; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_AMOUNT":
      return { ...state, amount: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    default:
      return state;
  }
};

const SendPage: React.FC = () => {
  const [errorData, setErrorData] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      setBalance(user.balance);
    }
  }, []);

  const handleSend = async () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("Користувача не знайдено");
      }
      const user = JSON.parse(userString);

      const res = await fetch(`https://povshy.github.io/pov24/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          amount: state.amount,
          name: state.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }

      const data = await res.json();

      dispatch({ type: "SET_AMOUNT", payload: "" });
      dispatch({ type: "SET_EMAIL", payload: "" });

      user.balance = data.newBalance; // Оновлюємо баланс користувача
      localStorage.setItem("user", JSON.stringify(user));
      console.log("AFTER_SEND_USER", user);

      setBalance(roundBalance(user.balance)); // Оновлюємо стан балансу

      setErrorData(null);
      alert(data.message);
    } catch (error: any) {
      setErrorData(error.message);
    }
  };

  return (
    <div>
      <BackButton />
      <div className="sending-page">
        <Title title="Send" />
        <div className="setting-block">
          <Field
            type="email"
            placeholder="Enter email ..."
            value={state.email}
            onChange={(e) =>
              dispatch({ type: "SET_EMAIL", payload: e.target.value })
            }
            label="Email:"
          />
        </div>
        <div className="setting-block">
          <Field
            type="number"
            placeholder=""
            value={state.amount}
            onChange={(e) =>
              dispatch({ type: "SET_AMOUNT", payload: e.target.value })
            }
            label="Sum"
            dollar
          />
        </div>
        {/* ------------------ */}

        <div>
          <Button onClick={handleSend} text="Send" dark />
          {errorData ? <p className="error-message">{errorData}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default SendPage;
