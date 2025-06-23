import React from "react";
import "./Sidebar.scss";
import { 
  Grid3x3Gap, 
  ChatSquare, 
  BookHalf, 
  TrophyFill, 
  Person,
  ChevronLeft,
  ChevronRight
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
    <div className={`simple-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        {!isCollapsed && (
          <div className="sidebar-brand">
            <img
              src="/icons/aitutor-short-no-bg.png"
              alt="AI Tutor"
              width="32"
              height="32"
              className="brand-logo"
            />
            <span className="brand-text">AI Tutor</span>
          </div>
        )}
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
            <div className="nav-icon">
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="nav-text">{item.text}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;