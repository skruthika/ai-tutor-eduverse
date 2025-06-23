import { useState } from "react";
import ChatScreen from './ChatScreen/ChatScreen';
import Sidebar from './SideBar/Sidebar';
import DashboardHome from "./DashboardHome/DashboardHome";
import LearningPaths from "./LearningPaths/LearningPaths";
import QuizSystem from "./QuizSystem/QuizSystem";
import './Dashboard.scss';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeScreen, setActiveScreen] = useState("dashboard");

  const renderMainContent = () => {
    switch (activeScreen) {
      case "dashboard":
        return <DashboardHome />;
      case "chat":
        return <ChatScreen />;
      case "learning-paths":
        return <LearningPaths />;
      case "quiz-system":
        return <QuizSystem />;
      case "courses":
        return <LearningPaths />; // Redirect courses to learning paths
      case "achievements":
        return <QuizSystem />; // Redirect achievements to quiz system for now
      case "profile":
        return <DashboardHome />; // Redirect profile to dashboard for now
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="simple-dashboard">
      {/* Enhanced Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        setActiveScreen={setActiveScreen}
        activeScreen={activeScreen}
      />

      {/* Main Content Area */}
      <div className="dashboard-main">
        {renderMainContent()}
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="mobile-overlay d-lg-none"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default Dashboard;