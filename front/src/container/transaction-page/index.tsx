import { useState, useEffect } from "react";
import "./index.css";
import { useParams } from "react-router-dom";

import Title from "../../component/title";
import BackButton from "../../component/back-button";

const TransactionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<{
    amount: number;
    type: string;
    name: string;
    userEmail: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (id) {
        try {
          const res = await fetch(
            `http://localhost:4000/transaction?id=${id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message);
          }

          const data = await res.json();
          setTransaction(data.transaction);
          console.log("Transaction data received:", data); // Додано для відладки
        } catch (error: any) {
          console.error("Error fetching transaction:", error.message); // Додано для відладки
          setError(error.message);
        }
      }
    };
    fetchTransaction();
  }, [id]);

  const userString = localStorage.getItem("user");
  if (!userString) {
    throw new Error("Користувача не знайдено");
  }

  const user = JSON.parse(userString);

  const isReceipt = (transaction: { type: string; name: string }) => {
    return (
      transaction.type === "Receipt" ||
      (transaction.type === "Sending" && transaction.name === user.email)
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

    return `${formattedDate.replace(",", "")}, ${formattedTime}`;
  };

  return (
    <div>
      <BackButton />
      <div className="sending-page">
        <Title title="Transaction" />
        {error ? (
          <p className="error-message">{error}</p>
        ) : transaction ? (
          <div className="transaction-details">
            {isReceipt(transaction) ? (
              <div className="amount__plus">
                +${transaction.amount.toFixed(2)}
              </div>
            ) : (
              <div className="amount__minus">
                -${transaction.amount.toFixed(2)}
              </div>
            )}

            <div className="transaction-info">
              <div className="transaction-value">
                <p>Date:</p>
                <p>{formatDate(transaction.date)}</p>
              </div>
              <hr className="line" />
              <div className="transaction-value">
                <p>Name:</p>
                <p>
                  {isReceipt(transaction)
                    ? transaction.userEmail
                    : transaction.name}
                </p>
              </div>
              <hr className="line" />
              <div className="transaction-value">
                <p>Type:</p>
                <p>{transaction.type}</p>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
