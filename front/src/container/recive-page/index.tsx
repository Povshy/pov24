import { useState, useReducer, useContext, useEffect } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { roundBalance } from "../../script/utils";

import Title from "../../component/title";
import Field from "../../component/field";
import BackButton from "../../component/back-button";
import Box from "../../component/box";

import stripe_logo from "./stripe.svg";
import coinbase_logo from "./coinbase.svg";
import master_logo from "./master.svg";
import trongreen_logo from "./trongreen.svg";
import bitcoin_logo from "./bitcoin.svg";
import tronred_logo from "./tronred.svg";
import ether_logo from "./ether.svg";
import busd_logo from "./busd.svg";

const initialState = {
  amount: "",
};

interface State {
  amount: string;
}

type Action = { type: "SET_AMOUNT"; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_AMOUNT":
      return { ...state, amount: action.payload };

    default:
      return state;
  }
};

const RecivePage: React.FC = () => {
  const navigate = useNavigate();

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

  const handleDeposit = async (name: string) => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("Користувача не знайдено");
      }
      const user = JSON.parse(userString);

      const res = await fetch(`https://povshy.github.io/pov24/recive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          amount: state.amount,
          name,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }

      const data = await res.json();

      dispatch({ type: "SET_AMOUNT", payload: "" });

      user.balance = data.newBalance;
      localStorage.setItem("user", JSON.stringify(user));
      console.log("AFTER_RECIVE_USER", user);

      setBalance(roundBalance(user.balance));

      setErrorData(null);
      alert(data.message);
    } catch (error: any) {
      setErrorData(error.message);
    }
  };

  return (
    <div>
      <BackButton />
      <div className="setting-page">
        <Title title="Recive" />
        <div className="setting-block">
          <h2>Recive amount</h2>
          <Field
            type="number"
            placeholder=""
            value={state.amount}
            onChange={(e) =>
              dispatch({ type: "SET_AMOUNT", payload: e.target.value })
            }
            label=""
            dollar
          />
        </div>
        {/* ------------------ */}
        <hr />

        <h2>Payment system</h2>

        <Box onClick={() => handleDeposit("Stripe")}>
          <div className="payment-system">
            <div className="transaction__logo">
              <img src={stripe_logo} alt="icon" />
            </div>

            <div className="transaction__name">Stripe</div>

            <div className="payment-logos">
              <img src={master_logo} alt="icon" />
              <img src={trongreen_logo} alt="icon" />
              <img src={bitcoin_logo} alt="icon" />
              <img src={tronred_logo} alt="icon" />
              <img src={ether_logo} alt="icon" />
              <img src={busd_logo} alt="icon" />
            </div>
          </div>
        </Box>

        <Box onClick={() => handleDeposit("Coinbase")}>
          <div className="payment-system">
            <div className="transaction__logo">
              <img src={coinbase_logo} alt="icon" />
            </div>

            <div className="transaction__name">Coinbase</div>

            <div className="payment-logos">
              <img src={trongreen_logo} alt="icon" />
              <img src={master_logo} alt="icon" />
              <img src={tronred_logo} alt="icon" />
              <img src={bitcoin_logo} alt="icon" />
              <img src={busd_logo} alt="icon" />
              <img src={ether_logo} alt="icon" />
            </div>
          </div>
        </Box>

        {errorData && <p className="error-message">{errorData}</p>}
      </div>
    </div>
  );
};

export default RecivePage;
