import React, { useState, useEffect } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import "./Sidebar.scss";
import { ListGroup, Badge } from "react-bootstrap";
import { 
  Grid3x3Gap, 
  BookHalf, 
  TrophyFill, 
  BarChartFill, 
  Folder2Open,
  ChevronDown,
  ChevronRight,
  Dot
} from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedLearningGoal } from "../../../globalSlice.js";
import { setLearningGoals } from "../../../globalSlice.js";
import { getAllLearningGoals } from "../../../api.js";

const Sidebar = ({
  isCollapsed,
  toggleSidebar,
  width,
  setWidth,
  setActiveScreen,
  setPreferencesCollapsed,
}) => {
  const [expandedItems, setExpandedItems] = useState({});
  const dispatch = useDispatch();
  const learningGoals = useSelector((state) => state.global.learningGoals);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const goals = await getAllLearningGoals();
        dispatch(setLearningGoals(goals));
      } catch (error) {
        console.error("Failed to fetch learning goals:", error);
      }
    };
    fetchGoals();
  }, [dispatch]);

  const menuItems = [
    {
      id: "dashboard",
      text: "Dashboard",
      icon: <Grid3x3Gap size={20} />,
      screen: "dashboard",
      badge: null,
    },
    {
      id: "courses",
      text: "My Courses",
      icon: <BookHalf size={20} />,
      screen: "learning-goal",
      badge: learningGoals.length > 0 ? learningGoals.length : null,
      subItems: ["All", ...learningGoals.map(goal => goal.name)],
      expandable: true,
    },
    {
      id: "progress",
      text: "Progress",
      icon: <BarChartFill size={20} />,
      screen: "milestones",
      badge: null,
    },
    {
      id: "resources",
      text: "Resources",
      icon: <Folder2Open size={20} />,
      screen: "assessments",
      badge: "New",
    },
  ];

  const handleItemClick = (item) => {
    if (item.expandable) {
      setExpandedItems(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    }
    
    setActiveScreen(item.screen);
    setPreferencesCollapsed(false);
    
    if (item.screen === "learning-goal") {
      dispatch(setSelectedLearningGoal('All'));
    }
  };

  const handleSubItemClick = (subItem) => {
    setActiveScreen("learning-goal");
    setPreferencesCollapsed(false);
    dispatch(setSelectedLearningGoal(subItem));
  };

  return (
    <ResizableBox
      width={isCollapsed ? 80 : width}
      height={Infinity}
      axis="x"
      className="resizable-box"
      minConstraints={[80]}
      maxConstraints={[400]}
      resizeHandles={["e"]}
      onResizeStop={(e, { size }) => setWidth(size.width)}
      style={{ height: "100vh" }}
    >
      <div className={`modern-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Grid3x3Gap size={20} />
          </button>
          {!isCollapsed && (
            <div className="sidebar-title">
              <h6 className="mb-0">Navigation</h6>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${expandedItems[item.id] ? 'expanded' : ''}`}
                  onClick={() => handleItemClick(item)}
                  title={isCollapsed ? item.text : undefined}
                >
                  <div className="nav-link-content">
                    <div className="nav-icon">
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="nav-text">{item.text}</span>
                        <div className="nav-extras">
                          {item.badge && (
                            <Badge 
                              bg={typeof item.badge === 'number' ? 'primary' : 'success'} 
                              className="nav-badge"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {item.expandable && (
                            <div className="expand-icon">
                              {expandedItems[item.id] ? 
                                <ChevronDown size={16} /> : 
                                <ChevronRight size={16} />
                              }
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </button>

                {/* Sub-menu */}
                {item.subItems && !isCollapsed && expandedItems[item.id] && (
                  <ul className="sub-nav-list">
                    {item.subItems.map((subItem, index) => (
                      <li key={index} className="sub-nav-item">
                        <button
                          className="sub-nav-link"
                          onClick={() => handleSubItemClick(subItem)}
                        >
                          <Dot size={16} className="sub-nav-icon" />
                          <span className="sub-nav-text">{subItem}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="footer-content">
              <div className="footer-stats">
                <div className="stat-item">
                  <div className="stat-number">{learningGoals.length}</div>
                  <div className="stat-label">Courses</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {learningGoals.filter(goal => goal.progress >= 100).length}
                  </div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResizableBox>
  );
};

export default Sidebar;