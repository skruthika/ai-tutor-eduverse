// Enhanced API configuration with new backend integration
const API_BASE_URL = "http://localhost:8000";

// Enhanced fetch wrapper with better error handling
const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  };

  try {
    console.log(`🔗 API Request: ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, defaultOptions);
    
    console.log(`📡 API Response: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error(`❌ API Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`🚨 API Request Failed: ${error.message}`);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running on http://localhost:8000');
    }
    
    if (error.message.includes('CORS')) {
      throw new Error('CORS error: Please check server configuration');
    }
    
    throw error;
  }
};

// Enhanced Authentication with new backend
export const login = async (username, password) => {
  try {
    const data = await apiRequest(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      localStorage.setItem("isAdmin", data.isAdmin || false);
      if (data.name) {
        localStorage.setItem("name", data.name);
      }
      
      if (data.isAdmin) {
        console.log(`🛡️ Admin privileges granted to ${username}`);
      }
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
};

export const signup = async (name, username, password, isAdmin = false) => {
  try {
    const isDefaultAdmin = username.toLowerCase() === "blackboxgenai@gmail.com";
    
    const data = await apiRequest(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      body: JSON.stringify({ 
        name, 
        username, 
        email: username, // Backend expects email field
        password, 
        is_admin: isAdmin || isDefaultAdmin 
      }),
    });

    if (data.isAdmin) {
      console.log(`🛡️ Admin account created for ${username}`);
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Signup failed");
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("preferences");
    sessionStorage.clear();
    
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Logout failed");
  }
};

export const checkAdminStatus = async () => {
  const username = localStorage.getItem("username");
  if (!username) return { isAdmin: false };

  try {
    const data = await apiRequest(
      `${API_BASE_URL}/auth/check-admin?username=${encodeURIComponent(username)}`
    );
    
    localStorage.setItem("isAdmin", data.isAdmin);
    
    if (data.isAdmin) {
      console.log(`🛡️ Admin status confirmed for ${username}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return { isAdmin: false };
  }
};

export const getAdminInfo = async () => {
  try {
    const data = await apiRequest(`${API_BASE_URL}/auth/admin-info`);
    return data;
  } catch (error) {
    console.error("Error fetching admin info:", error);
    return null;
  }
};

// Enhanced Chat API with new backend
export const fetchChatHistory = async () => {
  const username = localStorage.getItem("username");
  if (!username) throw new Error("No username found. Please log in.");

  try {
    const data = await apiRequest(
      `${API_BASE_URL}/chat/history?username=${encodeURIComponent(username)}`,
      { method: "GET" }
    );

    return data.history || [];
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw new Error(error.message || "Failed to fetch chat history");
  }
};

export const askQuestion = async (
  user_prompt,
  onMessageReceived,
  onComplete, 
  isQuiz, 
  isLearningPathQuery
) => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const url = `${API_BASE_URL}/chat/ask`;
    console.log(`🔗 Chat Request: ${url}`);

    const requestBody = {
      user_prompt,
      username,
      isQuiz: isQuiz || false,
      isLearningPath: isLearningPathQuery || false
    };

    if (!isLearningPathQuery) {
      // Streaming API Call (For non-learning-path queries)
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "text/plain",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedMessage = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedMessage += chunk;
        onMessageReceived(accumulatedMessage);
      }

      onComplete();
    } else {
      // Standard API Call (For learning path queries - Non-streaming)
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseText = await response.text();
      onMessageReceived(responseText);
      onComplete();
    }
  } catch (error) {
    console.error("❌ Chat Error:", error);
    throw error;
  }
};

// Enhanced Learning Goals API
export const getAllLearningGoals = async () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    // Use legacy endpoint for backward compatibility
    const data = await apiRequest(
      `${API_BASE_URL}/chat/get-all-goals?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    return data.learning_goals || [];
  } catch (error) {
    console.error("Error fetching learning goals:", error);
    throw error;
  }
};

export const saveLearningPath = async (learningPath, learningGoalName) => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const data = await apiRequest(`${API_BASE_URL}/chat/save-path`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: username,
        path: learningPath,
        learning_goal_name: learningGoalName,
      }),
    });

    return data;
  } catch (error) {
    console.error("Error saving learning path:", error);
    throw error;
  }
};

export const clearChat = async () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const data = await apiRequest(
      `${API_BASE_URL}/chat/clear?username=${encodeURIComponent(username)}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.error("Error clearing chat history:", error);
    throw error;
  }
};

export const savePreferencesAPI = async (preferences) => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const data = await apiRequest(`${API_BASE_URL}/auth/update-preferences`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ username, preferences }),
    });

    return data;
  } catch (error) {
    console.error("Error saving preferences:", error);
    throw error;
  }
};

// Enhanced User Profile API
export const getUserProfile = async () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const data = await apiRequest(
      `${API_BASE_URL}/auth/profile?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (data.isAdmin !== undefined) {
      localStorage.setItem("isAdmin", data.isAdmin);
    }

    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      name: localStorage.getItem("name") || "User",
      username: username,
      isAdmin: localStorage.getItem("isAdmin") === "true",
      preferences: {
        timeValue: 15,
        ageGroup: "Above 18",
        language: "English",
        userRole: "Student",
      }
    };
  }
};

// Enhanced User Statistics API
export const getUserStats = async () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    // Use legacy endpoint for backward compatibility
    const data = await apiRequest(
      `${API_BASE_URL}/chat/user-stats?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      totalGoals: 0,
      completedGoals: 0,
      totalQuizzes: 0,
      averageScore: 0,
      streakDays: 0,
      totalStudyTime: 0
    };
  }
};

// Enhanced Search API
export const searchMessages = async (query) => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const data = await apiRequest(
      `${API_BASE_URL}/chat/search?username=${encodeURIComponent(username)}&query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    return data.messages || [];
  } catch (error) {
    console.error("Error searching messages:", error);
    return [];
  }
};

// Enhanced Analytics API
export const getChatAnalytics = async (days = 30) => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const data = await apiRequest(
      `${API_BASE_URL}/chat/analytics?username=${encodeURIComponent(username)}&days=${days}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    return data.analytics || [];
  } catch (error) {
    console.error("Error fetching chat analytics:", error);
    return [];
  }
};

// Legacy endpoints for backward compatibility
export const getAssessments = async () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const data = await apiRequest(
      `${API_BASE_URL}/chat/assessments?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    return data.assessments || [];
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return [];
  }
};

export const deleteLearningGoal = async (goalName) => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const data = await apiRequest(`${API_BASE_URL}/chat/delete-goal`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ username, goal_name: goalName }),
    });

    return data;
  } catch (error) {
    console.error("Error deleting learning goal:", error);
    throw error;
  }
};

export const updateLearningGoal = async (goalName, updatedGoal) => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const data = await apiRequest(`${API_BASE_URL}/chat/update-goal`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        username, 
        goal_name: goalName, 
        updated_goal: updatedGoal 
      }),
    });

    return data;
  } catch (error) {
    console.error("Error updating learning goal:", error);
    throw error;
  }
};

// Test API connectivity
export const testConnection = async () => {
  try {
    const data = await apiRequest(`${API_BASE_URL}/health`);
    console.log("✅ Backend connection successful:", data);
    return data;
  } catch (error) {
    console.error("❌ Backend connection failed:", error);
    throw error;
  }
};

// Enhanced Admin API
export const getAdminDashboardStats = async () => {
  const username = localStorage.getItem("username");
  if (!username) throw new Error("User not authenticated");

  try {
    const data = await apiRequest(
      `${API_BASE_URL}/lessons/admin/dashboard?username=${encodeURIComponent(username)}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    throw error;
  }
};

export const getUsersOverview = async () => {
  const username = localStorage.getItem("username");
  if (!username) throw new Error("User not authenticated");

  try {
    const data = await apiRequest(
      `${API_BASE_URL}/auth/users-overview`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching users overview:", error);
    throw error;
  }
};

// Migration and Database Management
export const triggerMigration = async () => {
  try {
    const data = await apiRequest(`${API_BASE_URL}/admin/migrate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data;
  } catch (error) {
    console.error("Error triggering migration:", error);
    throw error;
  }
};

export const initializeDatabase = async () => {
  try {
    const data = await apiRequest(`${API_BASE_URL}/admin/initialize-db`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};