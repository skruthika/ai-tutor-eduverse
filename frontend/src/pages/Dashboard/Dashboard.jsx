import { useState } from "react";
import ChatScreen from './ChatScreen/ChatScreen';
import Sidebar from './SideBar/Sidebar';
import Preferences from './Preferences/Preferences';
import LearningPaths from "./LearningGoals/LearningPaths";
import Milestones from "./MIlestones/Milestones";
import Assessments from "./Assessments/Assessments";
import DashboardHome from "./DashboardHome/DashboardHome";
import './Dashboard.scss';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [preferencesCollapsed, setPreferencesCollapsed] = useState(false);
  const [learningWidth, setLearningWidth] = useState(600);
  const [preferencesWidth, setPreferencesWidth] = useState(400);
  const [activeScreen, setActiveScreen] = useState("dashboard");

  const renderMainContent = () => {
    switch (activeScreen) {
      case "dashboard":
        return <DashboardHome />;
      case "learning-goal":
        return (
          <LearningPaths
            isCollapsed={preferencesCollapsed}
            togglePreferences={() => setPreferencesCollapsed(!preferencesCollapsed)}
            width={learningWidth}
            setWidth={setLearningWidth}
          />
        );
      case "milestones":
        return (
          <Milestones
            isCollapsed={preferencesCollapsed}
            togglePreferences={() => setPreferencesCollapsed(!preferencesCollapsed)}
            width={preferencesWidth}
            setWidth={setPreferencesWidth}
          />
        );
      case "assessments":
        return (
          <Assessments
            isCollapsed={preferencesCollapsed}
            togglePreferences={() => setPreferencesCollapsed(!preferencesCollapsed)}
            width={learningWidth}
            setWidth={setLearningWidth}
          />
        );
      case "preference":
        return (
          <Preferences
            isCollapsed={preferencesCollapsed}
            togglePreferences={() => setPreferencesCollapsed(!preferencesCollapsed)}
            width={preferencesWidth}
            setWidth={setPreferencesWidth}
          />
        );
      default:
        return <ChatScreen />;
    }
  };

  return (
    <div className="modern-dashboard">
      {/* Left Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        width={sidebarWidth}
        setWidth={setSidebarWidth}
        setActiveScreen={setActiveScreen}
        setPreferencesCollapsed={setPreferencesCollapsed}
      />

      {/* Main Content Area */}
      <div className="dashboard-main">
        {activeScreen === "dashboard" ? (
          <DashboardHome />
        ) : activeScreen === "chat" ? (
          <div className="chat-container">
            <ChatScreen />
          </div>
        ) : (
          <div className="content-with-sidebar">
            <div className="main-content">
              <ChatScreen />
            </div>
            <div className="right-sidebar">
              {renderMainContent()}
            </div>
          </div>
        )}
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