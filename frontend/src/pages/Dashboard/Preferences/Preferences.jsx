import React, { useState, useEffect } from "react";
import { Image, Form, Button, Spinner, Alert } from "react-bootstrap";
import { ChevronLeft, ChevronRight, Person, Check } from "react-bootstrap-icons";
import { ResizableBox } from "react-resizable";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch } from "react-redux";
import { setPreferences } from "../../../globalSlice";
import { savePreferencesAPI, getUserProfile } from "../../../api";
import "./Preferences.scss";

const Preferences = ({ isCollapsed, togglePreferences, width, setWidth }) => {
  const dispatch = useDispatch();
  const [userProfile, setUserProfile] = useState(null);
  const [preferences, setPreferencesState] = useState({
    timeValue: 15,
    ageGroup: "Above 18",
    language: "English",
    userRole: "Student",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profile = await getUserProfile();
      setUserProfile(profile);
      
      if (profile.preferences) {
        setPreferencesState(profile.preferences);
        dispatch(setPreferences(profile.preferences));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferencesState((prev) => ({ ...prev, [key]: value }));
    setSuccess(false); // Reset success state when user makes changes
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      
      dispatch(setPreferences(preferences));
      
      await savePreferencesAPI(preferences);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving preferences:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ResizableBox
        width={isCollapsed ? 80 : width}
        height={"100%"}
        axis="x"
        minConstraints={[300, 0]}
        maxConstraints={[window.innerWidth * 0.6, 0]}
        onResizeStop={(e, { size }) => setWidth(size.width)}
      >
        <div className={`d-flex flex-column bg-light border-start h-100 p-3 ${isCollapsed ? "collapsed" : ""}`} style={{ width: "100%" }}>
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Loading profile...</p>
            </div>
          </div>
        </div>
      </ResizableBox>
    );
  }

  return (
    <ResizableBox
      width={isCollapsed ? 80 : width}
      height={"100%"}
      axis="x"
      minConstraints={[300, 0]}
      maxConstraints={[window.innerWidth * 0.6, 0]}
      onResizeStop={(e, { size }) => setWidth(size.width)}
    >
      <div className={`d-flex flex-column bg-light border-start h-100 p-3 ${isCollapsed ? "collapsed" : ""}`} style={{ width: "100%" }}>
        <div className="nav-heading" style={{ width: "100% !important" }}>
          <button 
            className="collapse-btn"
            variant="light"
            onClick={togglePreferences}
            style={{ width: "50px" }}
          >
            {isCollapsed ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="user-profile">
            <div className="profile-header">
              <div className="user-avatar">
                <Person size={48} className="text-primary" />
              </div>
              <h5>{userProfile?.name || "User"}</h5>
              <p className="email">{userProfile?.username || localStorage.getItem("username")}</p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="mb-3 d-flex align-items-center">
                <Check size={20} className="me-2" />
                Preferences saved successfully!
              </Alert>
            )}

            <div className="preferences bg-white">
              <h5 className="d-flex align-items-center">
                <Person size={20} className="me-2" />
                Learning Preferences
              </h5>
              
              <Form.Group className="time-slider">
                <Form.Label>
                  Daily Time Commitment: <strong>{preferences.timeValue} hrs</strong>
                </Form.Label>
                <Form.Range
                  min={1}
                  max={24}
                  value={preferences.timeValue}
                  onChange={(e) => handlePreferenceChange("timeValue", parseInt(e.target.value))}
                  className="custom-range"
                />
                <div className="range-labels">
                  <small>1 hr</small>
                  <small>24 hrs</small>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Age Group</Form.Label>
                <Form.Select 
                  value={preferences.ageGroup} 
                  onChange={(e) => handlePreferenceChange("ageGroup", e.target.value)}
                  className="custom-select"
                >
                  <option value="Under 10">Under 10</option>
                  <option value="10-16">10-16</option>
                  <option value="16-18">16-18</option>
                  <option value="Above 18">Above 18</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Preferred Language</Form.Label>
                <Form.Select 
                  value={preferences.language} 
                  onChange={(e) => handlePreferenceChange("language", e.target.value)}
                  className="custom-select"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>User Role</Form.Label>
                <Form.Select 
                  value={preferences.userRole} 
                  onChange={(e) => handlePreferenceChange("userRole", e.target.value)}
                  className="custom-select"
                >
                  <option value="Student">Student</option>
                  <option value="Parent">Parent</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Professional">Professional</option>
                </Form.Select>
              </Form.Group>

              <Button 
                className="w-100" 
                variant="primary" 
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} className="me-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>

            {/* User Stats Section */}
            <div className="user-stats mt-4 bg-white p-3 rounded">
              <h6 className="mb-3">Learning Statistics</h6>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">
                    {userProfile?.stats?.totalGoals || 0}
                  </div>
                  <div className="stat-label">Learning Goals</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {userProfile?.stats?.completedGoals || 0}
                  </div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {userProfile?.stats?.streakDays || 0}
                  </div>
                  <div className="stat-label">Day Streak</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {userProfile?.stats?.totalQuizzes || 0}
                  </div>
                  <div className="stat-label">Quizzes Taken</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResizableBox>
  );
};

export default Preferences;