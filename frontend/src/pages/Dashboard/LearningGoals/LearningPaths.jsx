import React, { useState, useEffect, useRef } from "react";
import "./LearningPaths.scss";
import { ResizableBox } from "react-resizable";
import { useSelector, useDispatch } from "react-redux";
import {
  setLearningGoals,
  setSelectedLearningGoal,
} from "../../../globalSlice.js";
import { askQuestion, getAllLearningGoals, deleteLearningGoal } from "../../../api.js";
import {
  Card,
  ListGroup,
  Button,
  Form,
  Badge,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import {
  ArrowLeft,
  List,
  X,
  CheckCircle,
  Clock,
  Link45deg,
  ArrowRight,
  QuestionCircle,
  ChevronRight,
  ChevronLeft,
  Trash,
  Pencil,
  Person,
  Plus,
} from "react-bootstrap-icons";

import {
  setIsGenerating,
  setChatHistory,
  setStreamChat,
  markTopicCompleted,
} from "../../../globalSlice.js";
import CircularProgressBar from "./CircularProgressBar.jsx";

const LearningPaths = ({ isCollapsed, togglePreferences, width, setWidth }) => {
  const learningGoals = useSelector((state) => state.global.learningGoals);
  const selectedLearningGoal = useSelector(
    (state) => state.global.selectedLearningGoal
  );
  const [selectedGoalDetails, setSelectedGoalDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const contentRef = useRef(null);
  const dispatch = useDispatch();
  const chatHistory = useSelector((state) => state.global.chatHistory);

  useEffect(() => {
    fetchGoals();
  }, [dispatch]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const goals = await getAllLearningGoals();
      dispatch(setLearningGoals(goals));
    } catch (error) {
      console.error("Failed to fetch learning goals:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof selectedLearningGoal === "string") {
      setSelectedLearningGoal(null);
      setSelectedGoalDetails(null);
      setSearchTerm(selectedLearningGoal);
    } else {
      setSearchTerm("");
    }
  }, [selectedLearningGoal, learningGoals, dispatch]);

  const handleMarkCompleted = (goal, topic, index) => {
    dispatch(markTopicCompleted({ goal, topic, index }));
    // Update local state to reflect changes
    if (selectedGoalDetails?.name === goal.name) {
      const updatedGoal = { ...selectedGoalDetails };
      updatedGoal.study_plans[0].topics[index].completed = true;
      setSelectedGoalDetails(updatedGoal);
    }
  };

  const handleViewDetails = (goal) => {
    setSelectedGoalDetails(goal);
    setWidth(1200);
  };

  const handleBackToList = () => {
    setSelectedGoalDetails(null);
    setWidth(600);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearSearch = () => setSearchTerm("");

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;
    
    try {
      setDeleting(true);
      await deleteLearningGoal(goalToDelete.name);
      
      // Refresh the goals list
      await fetchGoals();
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setGoalToDelete(null);
      
      // If we were viewing the deleted goal, go back to list
      if (selectedGoalDetails?.name === goalToDelete.name) {
        handleBackToList();
      }
    } catch (error) {
      console.error("Error deleting learning goal:", error);
      setError("Failed to delete learning goal. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredGoals = learningGoals.filter((goal) =>
    typeof searchTerm === "string"
      ? goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchTerm === "All"
      : true
  );

  const handleCheckMyProgress = async (goal, index) => {
    const selectedStudyPlan = selectedGoalDetails.study_plans[0].topics[index];
    const userPrompt = `I want to assess my Progress on ${selectedStudyPlan.name} ${selectedStudyPlan.description}, Generate me 10 quiz on these topics. Also don't show answers at start. Give options in a b c d. Format it in proper markdown format.`;

    const updatedHistory = [
      ...chatHistory,
      { role: "assistant", content: "", type: "streaming" },
    ];

    dispatch(setChatHistory(updatedHistory));
    dispatch(setIsGenerating(true));

    try {
      await askQuestion(
        userPrompt,
        (partialResponse) => {
          dispatch(setStreamChat(partialResponse));
        },
        () => {
          dispatch(setIsGenerating(false));
        },
        true,
        false
      );
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch(setIsGenerating(false));
    }
  };

  if (loading) {
    return (
      <ResizableBox
        width={isCollapsed ? 80 : width}
        height={"100%"}
        axis="x"
        minConstraints={[300, 0]}
        maxConstraints={[window.innerWidth * 1, 0]}
        resizeHandles={["w"]}
        onResizeStop={(e, { size }) => setWidth(size.width)}
      >
        <div className={`d-flex flex-column bg-light border-start h-100 p-3 ${isCollapsed ? "collapsed" : ""}`} style={{ width: "100%" }}>
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Loading learning goals...</p>
            </div>
          </div>
        </div>
      </ResizableBox>
    );
  }

  return (
    <>
      <ResizableBox
        width={isCollapsed ? 80 : width}
        height={"100%"}
        axis="x"
        minConstraints={[300, 0]}
        maxConstraints={[window.innerWidth * 1, 0]}
        resizeHandles={["w"]}
        onResizeStop={(e, { size }) => setWidth(size.width)}
      >
        <div
          className={`d-flex flex-column bg-light border-start h-100 p-3 ${
            isCollapsed ? "collapsed" : ""
          }`}
          style={{ width: "100%" }}
        >
          {!selectedGoalDetails && (
            <div className="nav-heading">
              <button 
                className="collapse-btn"
                variant="light"
                onClick={togglePreferences}
                style={{ width: "50px" }}
              >
                {isCollapsed ? <ChevronLeft /> : <ChevronRight />}
              </button>
            </div>
          )}

          {!isCollapsed && (
            <div
              ref={contentRef}
              style={{ overflowY: "auto", height: "calc(100vh - 100px)" }}
            >
              {error && (
                <Alert variant="warning" className="mb-3">
                  <Alert.Heading>Unable to load learning goals</Alert.Heading>
                  <p className="mb-0">
                    {error === "User not authenticated" 
                      ? "Please log in to view your learning goals." 
                      : "There was an issue loading your learning goals. Please try again."}
                  </p>
                  <hr />
                  <div className="d-flex justify-content-end">
                    <Button variant="outline-warning" size="sm" onClick={fetchGoals}>
                      Try Again
                    </Button>
                  </div>
                </Alert>
              )}

              {selectedGoalDetails ? (
                <div>
                  <Button
                    variant="light"
                    onClick={handleBackToList}
                    className="mb-3"
                  >
                    <ArrowLeft size={20} />
                  </Button>

                  <Card className="bg-white">
                    <Card.Body>
                      <div className="d-flex align-items-center">
                        <div style={{marginRight: "30px", marginLeft: "20px", height: "140px", position: "relative", top: "-35px"}}>
                          <CircularProgressBar
                            percentage={selectedGoalDetails?.progress || 0}
                          />
                        </div>
                        <div>
                          <h2 className="mb-3">{selectedGoalDetails.name}</h2>
                          <Card.Subtitle className="mb-3 d-flex align-items-center">
                            <Clock className="me-2" /> 
                            Duration: {selectedGoalDetails.duration}
                          </Card.Subtitle>
                        </div>
                      </div>

                      {selectedGoalDetails.study_plans.map((plan, planIndex) => (
                        <div key={planIndex} className="mb-4 mt-4 my-3">
                          <Card.Subtitle className="mb-3">
                            {plan.name} ({plan.course_duration})
                          </Card.Subtitle>
                          
                          {/* Links Section with Icons */}
                          {plan.links && plan.links.length > 0 && (
                            <ListGroup className="mb-3">
                              {plan.links.map((link, linkIndex) => (
                                <ListGroup.Item
                                  key={linkIndex}
                                  className="d-flex border-0 bg-white align-items-center"
                                >
                                  <Link45deg
                                    size={18}
                                    className="me-2 text-primary"
                                  />
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none"
                                  >
                                    {link}
                                  </a>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          )}

                          {/* Topics Section */}
                          {plan.topics && plan.topics.map((topic, topicIndex) => (
                            <div key={topic.name}>
                              <h3 className="mx-2">{topic.name}</h3>
                              <Card
                                key={topicIndex}
                                className="bg-white border-2 my-3"
                              >
                                <Card.Body className="">
                                  <Card.Text className="">
                                    {topic.description ||
                                      "No description available."}
                                  </Card.Text>
                                  <Card.Text>
                                    <Clock /> Time Required: {topic.time_required}{" "}
                                    hours
                                  </Card.Text>

                                  {/* Links Section */}
                                  {topic.links && topic.links.length > 0 && (
                                    <>
                                      <hr></hr>
                                      <h5>📚 External Study Resources</h5>
                                      <ListGroup className="mb-3">
                                        {topic.links.map((link, linkIndex) => (
                                          <ListGroup.Item
                                            key={linkIndex}
                                            className="d-flex border-0 bg-white  align-items-center"
                                          >
                                            <Link45deg
                                              size={18}
                                              className="me-2 text-primary"
                                            />
                                            <a
                                              href={link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-decoration-none"
                                            >
                                              {link}
                                            </a>
                                          </ListGroup.Item>
                                        ))}
                                      </ListGroup>
                                    </>
                                  )}

                                  {/* Subtopics Section */}
                                  {topic.subtopics &&
                                    topic.subtopics.length > 0 && (
                                      <>
                                        <hr></hr>
                                        <h5>📝 Subtopics</h5>
                                        <ListGroup className="bg-white">
                                          {topic.subtopics.map(
                                            (subtopic, subtopicIndex) => (
                                              <ListGroup.Item
                                                key={subtopicIndex}
                                                className="d-flex bg-white border-0 align-items-center"
                                              >
                                                <ArrowRight
                                                  size={16}
                                                  className="me-2"
                                                />
                                                <div>
                                                  <strong>{subtopic.name}</strong>
                                                  <p className="mb-0 text-muted">
                                                    {subtopic.description || ""}
                                                  </p>
                                                </div>
                                              </ListGroup.Item>
                                            )
                                          )}
                                        </ListGroup>
                                      </>
                                    )}

                                  {/* Videos Section */}
                                  {topic.videos && topic.videos.length > 0 && (
                                    <>
                                      <hr></hr>
                                      <h5>🎥 Video Resources</h5>
                                      <div className="video-container">
                                        {topic.videos.map((video, videoIndex) => {
                                          let videoId = null;

                                          // Extract video ID for different formats
                                          if (video.includes("youtu.be/")) {
                                            videoId = video
                                              .split("youtu.be/")[1]
                                              .split("?")[0];
                                          } else if (video.includes("watch?v=")) {
                                            videoId = video
                                              .split("watch?v=")[1]
                                              .split("&")[0];
                                          } else if (video.includes("/embed/")) {
                                            videoId = video
                                              .split("/embed/")[1]
                                              .split("?")[0];
                                          }

                                          return videoId ? (
                                            <div
                                              key={videoIndex}
                                              className="video-card"
                                            >
                                              {/* Embedded YouTube Video */}
                                              <iframe
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title={`Video ${videoIndex + 1}`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                              ></iframe>

                                              {/* Video Link Below */}
                                              <p className="video-link">
                                                <Link45deg
                                                  size={18}
                                                  className="me-1 text-primary"
                                                />
                                                <a
                                                  href={video}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-decoration-none"
                                                >
                                                  Watch on YouTube
                                                </a>
                                              </p>
                                            </div>
                                          ) : (
                                            <p
                                              key={videoIndex}
                                              className="text-danger"
                                            >
                                              Invalid YouTube URL: {video}
                                            </p>
                                          );
                                        })}
                                      </div>
                                    </>
                                  )}

                                  <hr></hr>
                                  <Button
                                    variant="outline-primary rounded-pill"
                                    size="sm"
                                    disabled={topic.completed ? true : false}
                                    onClick={() =>
                                      handleMarkCompleted(
                                        selectedGoalDetails,
                                        topic,
                                        topicIndex
                                      )
                                    }
                                    className="mb-2 border-1 "
                                  >
                                    <CheckCircle className="me-2" />{" "}
                                    {topic.completed
                                      ? "Completed"
                                      : "Mark as Complete"}
                                  </Button>
                                  <Button
                                    variant="outline-primary rounded-pill"
                                    size="sm"
                                    onClick={() =>
                                      handleCheckMyProgress(
                                        selectedGoalDetails,
                                        topicIndex
                                      )
                                    }
                                    className="mb-2 mx-2 border-1"
                                  >
                                    <QuestionCircle className="me-2" /> Create a
                                    quiz
                                  </Button>
                                </Card.Body>
                              </Card>
                            </div>
                          ))}
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                </div>
              ) : (
                <div>
                  {/* Search Bar with Clear Button */}
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="text"
                      placeholder="Search Learning Goals..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="mb-3 flex-grow-1"
                    />
                    {searchTerm && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="mb-3 ms-2"
                        onClick={handleClearSearch}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>

                  {/* Display Learning Goals */}
                  {filteredGoals.length === 0 ? (
                    <div className="text-center py-5">
                      <List size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No Learning Goals Yet</h5>
                      <p className="text-muted">
                        Create your first learning goal by asking AI Tutor to generate a study plan for any topic you want to learn!
                      </p>
                      <Button 
                        variant="outline-primary"
                        onClick={() => {
                          // Navigate to chat to create learning goal
                          console.log("Navigate to create learning goal");
                        }}
                      >
                        <Plus size={16} className="me-2" />
                        Create Learning Goal
                      </Button>
                    </div>
                  ) : (
                    filteredGoals.map((goal, index) => {
                      const randomProgress = goal?.progress || Math.floor(Math.random() * 100);
                      
                      return (
                        <Card
                          key={index}
                          style={{ borderRadius: "20px" }}
                          className="mb-3 bg-white hover-shadow"
                          onClick={() => handleViewDetails(goal)}
                        >
                          <div className="d-flex">
                            <div
                              className="mx-4"
                              style={{
                                position: "relative",
                                top: "-35px",
                                width: "100px",
                                height: "125px",
                              }}
                            >
                              <CircularProgressBar
                                className=""
                                percentage={randomProgress}
                              />
                            </div>
                            <Card.Body>
                              <div className="card-top">
                                <Card.Title style={{ 
                                  fontSize: "24px", 
                                  width: '100%', 
                                  maxWidth: "400px", 
                                  textOverflow: "wrap", 
                                  whiteSpace: "wrap"
                                }}>
                                  {goal.name}
                                </Card.Title>
                                <div className="d-flex">
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="me-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // TODO: Implement edit functionality
                                      console.log("Edit goal:", goal.name);
                                    }}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setGoalToDelete(goal);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <Trash size={16} />
                                  </Button>
                                </div>
                              </div>
                              <Card.Text>
                                <Clock /> Duration: {goal.duration}
                              </Card.Text>
                              <div className="d-flex flex-shrink column">
                                <div className="d-flex justify-content-between align-items-center">
                                  <Badge className="mt-2" bg={randomProgress > 0 ? "success" : "secondary"}>
                                    {randomProgress > 0 ? `${randomProgress}% Complete` : "Not Started"}
                                  </Badge>
                                  <div className="mt-3 mx-3">
                                    {goal.name.includes("Python") && (
                                      <>
                                        <Button
                                          title="Study Partner 1"
                                          variant="outline-primary rounded-pill"
                                          size="sm"
                                          className="me-2"
                                        >
                                          <Person size={16} />
                                        </Button>
                                        <Button
                                          title="Study Partner 2"
                                          variant="outline-primary rounded-pill"
                                          size="sm"
                                        >
                                          <Person size={16} />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card.Body>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </ResizableBox>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Learning Goal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>"{goalToDelete?.name}"</strong>?</p>
          <p className="text-muted">This action cannot be undone. All progress and data associated with this learning goal will be permanently removed.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteGoal}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash size={16} className="me-2" />
                Delete Goal
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LearningPaths;