import React from "react";
import { AuthProvider } from "./script/AuthContext";
import AuthRoute from "./script/AuthRoute";
import PrivateRoute from "./script/PrivateRoute";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import WellcomePage from "./container/wellcome-page";
import SignupPage from "./container/signup-page";
import SigninPage from "./container/signin-page";
import SignupConfirmPage from "./container/signup-confirm-page";
import RecoveryPage from "./container/recovery-page";
import RecoveryConfirmPage from "./container/recovery-confirm-page";
import BalancePage from "./container/balance";
import SettingsPage from "./container/settings-page";
import RecivePage from "./container/recive-page";
import SendPage from "./container/send-page";
import TransactionPage from "./container/transaction-page";
import NotificationPage from "./container/notification-page";
import Error from "./container/error-page";

import "./App.css";

function App() {
  console.log("App render"); // Додайте логування
  return (
    <AuthProvider>
      <div className="page">
        <BrowserRouter basename="/pov24">
          <Routes>
            <Route
              index
              element={
                <AuthRoute>
                  <WellcomePage />
                </AuthRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthRoute>
                  <SignupPage />
                </AuthRoute>
              }
            />
            <Route
              path="/signin"
              element={
                <AuthRoute>
                  <SigninPage />
                </AuthRoute>
              }
            />
            <Route
              path="/signup-confirm/:id"
              element={
                <AuthRoute>
                  <SignupConfirmPage />
                </AuthRoute>
              }
            />
            <Route
              path="/recovery"
              element={
                <AuthRoute>
                  <RecoveryPage />
                </AuthRoute>
              }
            />
            <Route
              path="/recovery-confirm/:id"
              element={
                <AuthRoute>
                  <RecoveryConfirmPage />
                </AuthRoute>
              }
            />
            <Route
              path="/balance/:id"
              element={
                <PrivateRoute>
                  <BalancePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/notification/:id"
              element={
                <PrivateRoute>
                  <NotificationPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/transaction/:id"
              element={
                <PrivateRoute>
                  <TransactionPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/recive"
              element={
                <PrivateRoute>
                  <RecivePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/send"
              element={
                <PrivateRoute>
                  <SendPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Error />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
