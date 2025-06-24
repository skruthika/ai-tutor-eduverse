# chat.py
import json
import datetime
import asyncio
import groq
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from database import chats_collection, users_collection
from constants import LEARNING_PATH_PROMPT, BASIC_ENVIRONMENT_PROMPT, REGENRATE_OR_FILTER_JSON, CALCULATE_SCORE
from fastapi import Body
from utils import extract_json
import os
from learning_path import process_learning_path_query

# Router for chat
chat_router = APIRouter()

client = groq.Client(api_key=os.getenv("API_KEY"))

def generate_response(prompt):
    """Generates a response using Groq's model"""
    try:
        response = client.chat.completions.create(
            model=os.getenv("MODEL_NAME"),
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating response: {e}")
        return "Error generating response. Please try again."

async def generate_chat_stream(messages):
    """Streams chat responses from Groq asynchronously"""
    try:
        response_stream = client.chat.completions.create(
            model=os.getenv("MODEL_NAME"),
            messages=messages,
            stream=True,
        )

        for chunk in response_stream:
            yield chunk.choices[0].delta.content
    except Exception as e:
        print(f"Error in chat stream: {e}")
        yield "Error in chat stream. Please try again."

def store_chat_history(username, messages):
    """Stores chat history in MongoDB"""
    try:
        chats_collection.update_one(
            {"username": username},
            {"$push": {"messages": messages}},
            upsert=True
        )
    except Exception as e:
        print(f"Error storing chat history: {e}")

def filter_messages(messages):
    """Filters messages to keep only role and content."""
    return [{"role": msg["role"], "content": msg["content"]} for msg in messages if "role" in msg and "content" in msg]

def update_user_stats(username, stat_type, increment=1):
    """Updates user statistics"""
    try:
        users_collection.update_one(
            {"username": username},
            {"$inc": {f"stats.{stat_type}": increment}},
            upsert=True
        )
    except Exception as e:
        print(f"Error updating user stats: {e}")

def enhance_prompt_for_concept_explanation(user_prompt):
    """Enhance prompts for concept explanation requests"""
    concept_enhancement = """
    Please provide a clear, detailed explanation of this concept. Structure your response as follows:
    1. **Definition**: Start with a simple, clear definition
    2. **Key Points**: Break down the main components or aspects
    3. **Examples**: Provide practical, real-world examples
    4. **Applications**: Explain where and how this concept is used
    5. **Common Misconceptions**: Address any frequent misunderstandings
    
    Make the explanation accessible and engaging, using analogies where helpful.
    """
    return f"{user_prompt}\n\n{concept_enhancement}"

def enhance_prompt_for_homework_help(user_prompt):
    """Enhance prompts for homework help requests"""
    homework_enhancement = """
    Please provide step-by-step guidance for this homework problem. Structure your response as follows:
    1. **Understanding the Problem**: Break down what's being asked
    2. **Approach**: Explain the method or strategy to solve it
    3. **Step-by-Step Solution**: Walk through each step clearly
    4. **Key Concepts**: Highlight the important principles involved
    5. **Tips**: Provide helpful hints for similar problems
    
    Focus on teaching the process rather than just giving the answer, so the student can learn and apply the method to other problems.
    """
    return f"{user_prompt}\n\n{homework_enhancement}"

@chat_router.post("/ask")
async def chat(user_prompt: str, username: str, isQuiz: bool = False, isLearningPath: bool = False):
    """Handles chat requests (both normal and streaming responses)"""
    try:
        print(f"👤 User: {user_prompt} | 🆔 Username: {username}")

        user_timestamp = datetime.datetime.utcnow().isoformat() + "Z"

        chat_session = chats_collection.find_one({"username": username}) or {}
        prev_5_messages = chat_session.get("messages", [])[-10:] if "messages" in chat_session else []
        prev_5_messages = [msg for msg in prev_5_messages if msg.get("type") != "learning_path"]
        
        # Enhance prompts based on content type
        enhanced_prompt = user_prompt
        if "explain" in user_prompt.lower() and "concept" in user_prompt.lower():
            enhanced_prompt = enhance_prompt_for_concept_explanation(user_prompt)
        elif "homework" in user_prompt.lower() or "help" in user_prompt.lower():
            enhanced_prompt = enhance_prompt_for_homework_help(user_prompt)
        
        user_message = {
            "role": "user",
            "content": enhanced_prompt,
            "type": "content",
            "timestamp": user_timestamp
        }
        
        if not isQuiz: 
            store_chat_history(username, user_message)
        prev_5_messages.append(user_message)

        if isQuiz:
            enhanced_prompt = f"{enhanced_prompt} {CALCULATE_SCORE}"
            # Update quiz stats
            update_user_stats(username, "totalQuizzes")
        
        # Case 1: Learning Path JSON generation 
        if isLearningPath:
            user_preferences = chat_session.get("preferences", {})
            prompt_with_preference = LEARNING_PATH_PROMPT.format(
                userRole=user_preferences.get("userRole", "Student"),
                timeValue=user_preferences.get("timeValue", 5),
                language=user_preferences.get("language", "English"),
                ageGroup=user_preferences.get("ageGroup", "Under 18")
            )

            user_message = {
                "role": "user",
                "content": enhanced_prompt,
                "type": "learning_path",
                "timestamp": user_timestamp
            }
            store_chat_history(username, user_message)
            return process_learning_path_query(enhanced_prompt, username, generate_response, extract_json, store_chat_history, REGENRATE_OR_FILTER_JSON, prompt_with_preference)

        # Case 2 : Stream prompt
        enhanced_prompt = f"{enhanced_prompt} {BASIC_ENVIRONMENT_PROMPT}"

        async def chat_stream():
            response_content = ""
            async for token in generate_chat_stream(filter_messages(prev_5_messages)):
                if token:  # Ensure token is not None
                    response_content += token
                    yield token

            response_timestamp = datetime.datetime.utcnow().isoformat() + "Z"
            response_message = {
                "role": "assistant",
                "content": response_content,
                "type": "content",
                "timestamp": response_timestamp
            }
            store_chat_history(username, response_message)

        return StreamingResponse(chat_stream(), media_type="text/plain")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        response_timestamp = datetime.datetime.utcnow().isoformat() + "Z"
        response_message = {
            "role": "assistant",
            "content": "There seems to be some error on our side, Please try again later.",
            "type": "content",
            "timestamp": response_timestamp
        }
        store_chat_history(username, response_message)
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.get("/history")
async def get_chat_history(username: str):
    print(f"Fetching Chat History for: {username}")

    chat_session = chats_collection.find_one({"username": username})
    
    if not chat_session:
        raise HTTPException(status_code=404, detail="No chat history found for this user.")
    
    messages = chat_session.get("messages", [])
    return {"history": messages}

@chat_router.post("/save-path")
async def save_path(
    username: str = Body(...),
    path: dict = Body(...),
    learning_goal_name: str = Body(None)
):
    """Saves learning path as part of a learning goal."""
    try:
        if not isinstance(path, dict):
            raise HTTPException(status_code=400, detail="Path must be a valid JSON object")

        chat_session = chats_collection.find_one({"username": username}) or {}
        learning_goals = chat_session.get("learning_goals", [])

        if not learning_goal_name:
            learning_goal_name = f"Unnamed Learning Goal {len(learning_goals) + 1}"

        duration = path.get("course_duration", "Unknown")

        existing_goal = next((goal for goal in learning_goals if goal["name"] == learning_goal_name), None)

        if existing_goal:
            existing_goal["study_plans"].append(path)
        else:
            new_goal = {
                "name": learning_goal_name,
                "duration": duration,
                "study_plans": [path],
                "progress": 0,
                "created_at": datetime.datetime.utcnow().isoformat() + "Z"
            }
            learning_goals.append(new_goal)
            
            # Update user stats
            update_user_stats(username, "totalGoals")

        chats_collection.update_one(
            {"username": username},
            {"$set": {"learning_goals": learning_goals}},
            upsert=True
        )

        return {"message": f"Learning path saved successfully under '{learning_goal_name}'"}
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.get("/get-all-goals")
async def get_all_goals(username: str):
    """Retrieves all learning goals for a given user."""
    try:
        chat_session = chats_collection.find_one({"username": username})
        if not chat_session or "learning_goals" not in chat_session:
            return {"learning_goals": []}  # Return empty list if no goals found
        
        return {"learning_goals": chat_session["learning_goals"]}
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.delete("/delete-goal")
async def delete_learning_goal(username: str = Body(...), goal_name: str = Body(...)):
    """Deletes a specific learning goal."""
    try:
        chat_session = chats_collection.find_one({"username": username})
        if not chat_session or "learning_goals" not in chat_session:
            raise HTTPException(status_code=404, detail="No learning goals found for this user")

        learning_goals = chat_session["learning_goals"]
        updated_goals = [goal for goal in learning_goals if goal["name"] != goal_name]

        if len(updated_goals) == len(learning_goals):
            raise HTTPException(status_code=404, detail="Learning goal not found")

        chats_collection.update_one(
            {"username": username},
            {"$set": {"learning_goals": updated_goals}}
        )

        # Update user stats
        update_user_stats(username, "totalGoals", -1)

        return {"message": f"Learning goal '{goal_name}' deleted successfully"}
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.put("/update-goal")
async def update_learning_goal(
    username: str = Body(...), 
    goal_name: str = Body(...), 
    updated_goal: dict = Body(...)
):
    """Updates a specific learning goal."""
    try:
        chat_session = chats_collection.find_one({"username": username})
        if not chat_session or "learning_goals" not in chat_session:
            raise HTTPException(status_code=404, detail="No learning goals found for this user")

        learning_goals = chat_session["learning_goals"]
        goal_index = next((i for i, goal in enumerate(learning_goals) if goal["name"] == goal_name), None)

        if goal_index is None:
            raise HTTPException(status_code=404, detail="Learning goal not found")

        # Update the goal while preserving the original structure
        learning_goals[goal_index].update(updated_goal)
        learning_goals[goal_index]["updated_at"] = datetime.datetime.utcnow().isoformat() + "Z"

        chats_collection.update_one(
            {"username": username},
            {"$set": {"learning_goals": learning_goals}}
        )

        return {"message": f"Learning goal '{goal_name}' updated successfully"}
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@chat_router.get("/user-stats")
async def get_user_stats(username: str = Query(...)):
    """Retrieves user statistics."""
    try:
        print(f"📊 Fetching user stats for: {username}")
        
        # Get stats from user collection
        user = users_collection.find_one({"username": username})
        if not user:
            print(f"⚠️ User not found in users collection: {username}")
            # Create default user stats if user doesn't exist
            default_stats = {
                "totalGoals": 0,
                "completedGoals": 0,
                "totalQuizzes": 0,
                "averageScore": 0,
                "streakDays": 0,
                "totalStudyTime": 0
            }
            return default_stats

        # Get real-time data from chat collection
        chat_session = chats_collection.find_one({"username": username})
        learning_goals = chat_session.get("learning_goals", []) if chat_session else []
        messages = chat_session.get("messages", []) if chat_session else []

        # Calculate real-time stats
        total_goals = len(learning_goals)
        completed_goals = sum(1 for goal in learning_goals if goal.get("progress", 0) >= 100)
        
        # Count quiz messages in chat history - Fixed the error here
        quiz_messages = []
        for msg in messages:
            content = msg.get("content", "")
            # Ensure content is a string before calling .lower()
            if isinstance(content, str) and "quiz" in content.lower():
                quiz_messages.append(msg)
        
        total_quizzes = len(quiz_messages)

        # Calculate study time (estimate based on learning goals and progress)
        total_study_time = 0
        for goal in learning_goals:
            study_plans = goal.get("study_plans", [])
            if isinstance(study_plans, list):
                for plan in study_plans:
                    if isinstance(plan, dict) and plan.get("topics"):
                        topics = plan.get("topics", [])
                        if isinstance(topics, list):
                            for topic in topics:
                                if isinstance(topic, dict) and topic.get("completed"):
                                    # Estimate study time based on time_required
                                    time_str = topic.get("time_required", "0")
                                    if isinstance(time_str, str):
                                        try:
                                            hours = int(''.join(filter(str.isdigit, time_str)))
                                            total_study_time += hours
                                        except (ValueError, TypeError):
                                            pass

        stats = {
            "totalGoals": total_goals,
            "completedGoals": completed_goals,
            "totalQuizzes": total_quizzes,
            "averageScore": user.get("stats", {}).get("averageScore", 0) if isinstance(user.get("stats"), dict) else 0,
            "streakDays": user.get("stats", {}).get("streakDays", 0) if isinstance(user.get("stats"), dict) else 0,
            "totalStudyTime": total_study_time
        }

        # Update user stats in database
        users_collection.update_one(
            {"username": username},
            {"$set": {"stats": stats}},
            upsert=True
        )

        print(f"✅ User stats calculated successfully: {stats}")
        return stats
        
    except Exception as e:
        print(f"❌ Error in get_user_stats: {str(e)}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        
        # Return default stats on error to prevent frontend crashes
        default_stats = {
            "totalGoals": 0,
            "completedGoals": 0,
            "totalQuizzes": 0,
            "averageScore": 0,
            "streakDays": 0,
            "totalStudyTime": 0
        }
        return default_stats

@chat_router.get("/assessments")
async def get_assessments(username: str = Query(...)):
    """Retrieves user assessments/quiz history."""
    try:
        chat_session = chats_collection.find_one({"username": username})
        if not chat_session:
            return {"assessments": []}

        messages = chat_session.get("messages", [])
        assessments = []

        # Extract quiz-related messages and create assessment records
        for i, message in enumerate(messages):
            content = message.get("content", "")
            # Ensure content is a string before calling .lower()
            if isinstance(content, str) and "quiz" in content.lower() and message.get("role") == "user":
                # Look for the AI response that follows
                ai_response = None
                if i + 1 < len(messages) and messages[i + 1].get("role") == "assistant":
                    ai_response = messages[i + 1].get("content", "")

                # Determine assessment type and subject
                assessment_type = "Quiz"
                subject = "General"
                
                if "python" in content.lower():
                    subject = "Python Programming"
                elif "javascript" in content.lower() or "js" in content.lower():
                    subject = "JavaScript"
                elif "math" in content.lower():
                    subject = "Mathematics"
                elif "science" in content.lower():
                    subject = "Science"

                # Generate a mock score (in real implementation, this would be calculated)
                import random
                score = f"{random.randint(6, 10)}/10"
                
                assessment = {
                    "id": f"quiz_{i}",
                    "type": f"{subject} {assessment_type}",
                    "subject": subject,
                    "date": message.get("timestamp", datetime.datetime.utcnow().isoformat() + "Z"),
                    "score": score,
                    "status": "completed" if ai_response else "pending"
                }
                assessments.append(assessment)

        # Add some sample pending assessments if none exist
        if not assessments:
            sample_assessments = [
                {
                    "id": "sample_1",
                    "type": "Python Basics Quiz",
                    "subject": "Python Programming",
                    "date": datetime.datetime.utcnow().isoformat() + "Z",
                    "score": "0/10",
                    "status": "pending"
                },
                {
                    "id": "sample_2",
                    "type": "Mathematics Quiz",
                    "subject": "Mathematics",
                    "date": datetime.datetime.utcnow().isoformat() + "Z",
                    "score": "0/10",
                    "status": "pending"
                }
            ]
            assessments.extend(sample_assessments)

        return {"assessments": assessments}
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@chat_router.delete("/clear")
async def clear_chat(username: str):
    """Clears the chat history for a specific user."""
    try:
        result = chats_collection.update_one(
            {"username": username},
            {"$set": {"messages": []}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="No chat history found for this user.")

        return {"message": "Chat history cleared successfully."}
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# New API to store user preferences
@chat_router.post("/save-preferences")
async def save_preferences(username: str = Body(...), preferences: dict = Body(...)):
    """Stores user preferences in the database."""
    try:
        if not isinstance(preferences, dict):
            raise HTTPException(status_code=400, detail="Preferences must be a valid JSON object")

        # Update preferences in both users and chats collections
        users_collection.update_one(
            {"username": username},
            {"$set": {"preferences": preferences}},
            upsert=True
        )

        chats_collection.update_one(
            {"username": username},
            {"$set": {"preferences": preferences}},
            upsert=True
        )

        return {"message": "Preferences saved successfully."}
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))