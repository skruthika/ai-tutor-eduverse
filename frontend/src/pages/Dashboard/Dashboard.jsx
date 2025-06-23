import { useState } from "react";
import ChatScreen from './ChatScreen/ChatScreen';
import Sidebar from './SideBar/Sidebar';
import DashboardHome from "./DashboardHome/DashboardHome";
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
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="simple-dashboard">
      {/* Simplified Sidebar */}
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