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
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  
  // More robust authentication check
  return !!(token && username && token.trim() !== "" && username.trim() !== "");
};

const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/welcome" replace />;
};

const PublicRoute = ({ element }) => {
  return !isAuthenticated() ? element : <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <ThemeProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Router>
            <Routes>
              {/* Root route - redirect based on authentication */}
              <Route 
                path="/" 
                element={
                  isAuthenticated() ? 
                    <Navigate to="/dashboard" replace /> : 
                    <Navigate to="/welcome" replace />
                } 
              />
              
              {/* Public routes */}
              <Route 
                path="/welcome" 
                element={<PublicRoute element={<Welcome />} />} 
              />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={<ProtectedRoute element={<Dashboard />} />}
              >
                <Route index element={<ChatScreen />} />
              </Route>
              
              {/* Catch all route - redirect to appropriate page */}
              <Route 
                path="*" 
                element={
                  isAuthenticated() ? 
                    <Navigate to="/dashboard" replace /> : 
                    <Navigate to="/welcome" replace />
                } 
              />
            </Routes>
          </Router>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;