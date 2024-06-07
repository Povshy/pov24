import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { roundBalance } from "../../script/utils";
import "./index.css";

import { useParams } from "react-router-dom";

import stripe_logo from "./stripe.svg";
import coinbase_logo from "./coinbase.svg";
import send_logo from "./send.svg";

import bell_logo from "./bell.svg";
import receive_logo from "./receive.svg";
import sending_logo from "./sending.svg";
import settings_logo from "./settings.svg";

const BalancePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [balance, setBalance] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [trans, setTrans] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          throw new Error("Користувача не знайдено");
        }

        const user = JSON.parse(userString);
        if (!user.id) {
          throw new Error("ID користувача не вказано");
        }

        const res = await fetch(`http://localhost:4000/balance?id=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message);
        }

        const data = await res.json();
        setBalance(roundBalance(data.balance));
        setEmail(data.email);
        setTrans(data.transactions);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchBalance();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  const logoMap: { [key: string]: string } = {
    Stripe: stripe_logo,
    Coinbase: coinbase_logo,
    Sending: send_logo,
  };

  const getLogo = (transaction: { type: string; name: string }) => {
    if (transaction.type === "Sending") {
      return logoMap.Sending;
    }
    return logoMap[transaction.name];
  };

  const isReceipt = (transaction: { type: string; name: string }) => {
    return (
      transaction.type === "Receipt" ||
      (transaction.type === "Sending" && transaction.name === email)
    );
  };

  const formatDate = (dateString: string) => {
    const [datePart, timePart] = dateString.split(", ");
    const [day, month, year] = datePart.split(".");
    const date = new Date(`${year}-${month}-${day}T${timePart}`);

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "2-digit",
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    };

    const formattedDate = date.toLocaleDateString("en-US", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

    return `${formattedTime}`;
  };

  return (
    <div className="balance-page">
      <div className="header">
        <div className="navigate">
          <div className="click" onClick={() => navigate(`/settings`)}>
            <img src={settings_logo} alt="settings" />
          </div>
          <p>Профіль: {email}</p>
          <div
            className="click"
            onClick={() => navigate(`/notification/${id}`)}
          >
            <img src={bell_logo} alt="bell" />
          </div>
        </div>
        <h1>$ {balance?.toFixed(2)}</h1>
      </div>

      <div className="balance-buttons">
        <div className="todo-button">
          <div className="round-button" onClick={() => navigate(`/recive`)}>
            <img src={receive_logo} alt="receive" />
          </div>
          <p>Receive</p>
        </div>

        <div className="todo-button">
          <div className="round-button" onClick={() => navigate(`/send`)}>
            <img src={sending_logo} alt="send" />
          </div>
          <p>Send</p>
        </div>
      </div>
      <div className="transactions">
        {trans && trans.length > 0 ? (
          trans
            .slice()
            .reverse()
            .map((transaction, index) => (
              <div
                key={index}
                className="transaction__item"
                onClick={() => navigate(`/transaction/${transaction.id}`)}
              >
                <div className="transaction__logo">
                  <img src={getLogo(transaction)} alt={transaction.name} />
                </div>

                <div className="transaction__info">
                  <h4 className="transaction__name">
                    {isReceipt(transaction)
                      ? transaction.userEmail
                      : transaction.name}
                  </h4>
                  <span className="trans__date">
                    {formatDate(transaction.date)} ---{" "}
                    {isReceipt(transaction) ? "Receipt" : transaction.type}
                  </span>
                </div>

                {isReceipt(transaction) ? (
                  <div className="transaction__plus">
                    +${transaction.amount.toFixed(2)}
                  </div>
                ) : (
                  <div className="transaction__minus">
                    -${transaction.amount.toFixed(2)}
                  </div>
                )}
              </div>
            ))
        ) : (
          <p className="no-trans">Список транзакцій порожній...</p>
        )}
      </div>
    </div>
  );
};

export default BalancePage;
