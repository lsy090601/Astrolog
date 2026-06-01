import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import DiaryPage from "./pages/DiaryPage";
import ChartPage from "./pages/ChartPage";
import InsightPage from "./pages/InsightPage";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/diary"
          element={
            <PrivateRoute>
              <DiaryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chart"
          element={
            <PrivateRoute>
              <ChartPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/insight"
          element={
            <PrivateRoute>
              <InsightPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
