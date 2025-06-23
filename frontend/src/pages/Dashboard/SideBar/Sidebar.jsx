import React from "react";
import "./Sidebar.scss";
import { 
  Grid3x3Gap, 
  ChatSquare, 
  BookHalf, 
  TrophyFill, 
  Person,
  ChevronLeft,
  ChevronRight,
  Map,
  QuestionCircle
} from "react-bootstrap-icons";

const Sidebar = ({
  isCollapsed,
  toggleSidebar,
  setActiveScreen,
  activeScreen
}) => {

  const menuItems = [
    {
      id: "dashboard",
      text: "Dashboard",
      icon: <Grid3x3Gap size={20} />,
      screen: "dashboard",
    },
    {
      id: "chat",
      text: "AI Chat",
      icon: <ChatSquare size={20} />,
      screen: "chat",
    },
    {
      id: "learning-paths",
      text: "Learning Paths",
      icon: <Map size={20} />,
      screen: "learning-paths",
    },
    {
      id: "quiz-system",
      text: "Quiz System",
      icon: <QuestionCircle size={20} />,
      screen: "quiz-system",
    },
    {
      id: "courses",
      text: "My Courses",
      icon: <BookHalf size={20} />,
      screen: "courses",
    },
    {
      id: "achievements",
      text: "Achievements",
      icon: <TrophyFill size={20} />,
      screen: "achievements",
    },
    {
      id: "profile",
      text: "Profile",
      icon: <Person size={20} />,
      screen: "profile",
    },
  ];

  const handleItemClick = (item) => {
    setActiveScreen(item.screen);
  };

  return (
    <div className={`optimized-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar Toggle */}
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeScreen === item.screen ? 'active' : ''}`}
            onClick={() => handleItemClick(item)}
            title={isCollapsed ? item.text : undefined}
          >
            <div className="nav-content">
              <div className="nav-icon">
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="nav-text">{item.text}</span>
              )}
            </div>
            {activeScreen === item.screen && <div className="active-indicator" />}
          </button>
        ))}
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="footer-stats">
            <div className="stat-item">
              <div className="stat-number">8</div>
              <div className="stat-label">Goals</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">5</div>
              <div className="stat-label">Done</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;