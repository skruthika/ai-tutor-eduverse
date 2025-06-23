import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./pages/Dashboard/Dashboard";
import ChatScreen from "./pages/Dashboard/ChatScreen/ChatScreen";
import Welcome from "./pages/welcome/Welcome";
import Header from "./pages/Header/Header";
import Footer from "./components/Footer/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.scss";
import "./styles/themes.scss";

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/welcome" replace />;
};

const App = () => {
  return (
    <ThemeProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Router>
            <Routes>
              <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/welcome" replace />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />}>
                <Route index element={<ChatScreen />} />
              </Route>
            </Routes>
          </Router>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;