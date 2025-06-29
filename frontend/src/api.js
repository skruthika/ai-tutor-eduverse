const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"; // Use environment variable or default to localhost:8000

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Login failed");

    localStorage.setItem("token", data.token); // Store token
    localStorage.setItem("username", username); // Store username
    if (data.name)
      localStorage.setItem("name", data.name);

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const signup = async (name, username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Signup failed");

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const fetchChatHistory = async () => {
  const username = localStorage.getItem("username");
  if (!username) throw new Error("No username found. Please log in.");

  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/history?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.detail || "Failed to fetch chat history");

    return data.history;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const askQuestion = async (
  user_prompt,
  onMessageReceived,
  onComplete, isQuiz, isLearningPathQuery
) => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const queryParams = new URLSearchParams({
      user_prompt,
      username,
      isQuiz, 
      isLearningPath : isLearningPathQuery
    }).toString();
    const url = `${API_BASE_URL}/chat/ask?${queryParams}`;

    if (!isLearningPathQuery) {
      // 🔥 Streaming API Call (For non-learning-path queries)
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedMessage = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // ✅ FIX: Treat response as plain text, not JSON
        const chunk = decoder.decode(value, { stream: true });

        // ✅ Accumulate message and update UI
        accumulatedMessage += chunk;
        onMessageReceived(accumulatedMessage);
      }

      onComplete();
    } else {
      // 🔥 Standard API Call (For learning path queries - Non-streaming)
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      // Learning path response is plain text (not streamed)
      const responseText = await response.text();
      onMessageReceived(responseText);

      onComplete();
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

/// Save Learning Path API Call
export const saveLearningPath = async (learningPath, learningGoalName) => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const response = await fetch(`${API_BASE_URL}/chat/save-path`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: username,
        path: learningPath,
        learning_goal_name: learningGoalName,
      }),
    });

    if (!response.ok) throw new Error("Failed to save learning path");
    return await response.json();
  } catch (error) {
    console.error("Error saving learning path:", error);
  }
};

// Get All Learning Goals API Call
export const getAllLearningGoals = async () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/get-all-goals?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch learning goals");
    const data = await response.json();
    return data.learning_goals; // Return the learning_goals array
  } catch (error) {
    console.error("Error fetching learning goals:", error);
    throw error; // Re-throw the error so the caller can handle it
  }
};

export const clearChat = async () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/clear?username=${encodeURIComponent(username)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to clear chat history");

    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/chat/save-preferences`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, preferences }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to save preferences");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving preferences:", error);
    throw error;
  }
};

/**
 * Get user profile information
 * Retrieves the user's profile details from the backend
 */
export const getUserProfile = async () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/profile?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch user profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Update user profile information
 * @param {Object} profileData - Object containing profile data to update
 */
export const updateUserProfile = async (profileData) => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        username, 
        ...profileData 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update user profile");
    }

    const data = await response.json();
    
    // Update local storage with new data if available
    if (data.name) localStorage.setItem("name", data.name);
    
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Get user preferences
 * Retrieves the user's preferences from the backend
 */
export const getPreferences = async () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) throw new Error("User not authenticated");

  try {
    const response = await fetch(
      `${API_BASE_URL}/chat/preferences?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch user preferences");
    }

    const data = await response.json();
    
    // Update local storage with the latest preferences
    if (data.preferences) {
      localStorage.setItem("preferences", JSON.stringify(data.preferences));
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    throw error;
  }
};