import os
import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from database import users_collection, chats_collection
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Router for authentication
auth_router = APIRouter()

# JWT Secret
JWT_SECRET = os.getenv("JWT_SECRET")

# Request Models
class SignupRequest(BaseModel):
    name: str
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

# Password Hashing
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

# Generate JWT Token
def create_jwt_token(username: str):
    expiration = datetime.utcnow() + timedelta(days=1)
    payload = {"sub": username, "exp": expiration}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

# Signup Endpoint
@auth_router.post("/signup")
async def signup(request: SignupRequest):
    if not request.name.strip() or not request.username.strip() or not request.password.strip():
        raise HTTPException(status_code=400, detail="All fields are required")

    if users_collection.find_one({"username": request.username}):
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(request.password)

    # Default Preferences
    default_preferences = {
        "userRole": "Student",
        "timeValue": 15,
        "language": "English",
        "ageGroup": "Above 18"
    }

    # Create user document
    user_doc = {
        "name": request.name,
        "username": request.username,
        "password": hashed_password,
        "preferences": default_preferences,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "stats": {
            "totalGoals": 0,
            "completedGoals": 0,
            "totalQuizzes": 0,
            "averageScore": 0,
            "streakDays": 0,
            "totalStudyTime": 0
        }
    }

    users_collection.insert_one(user_doc)

    return {"message": "User registered successfully with default preferences"}

# Login Endpoint
@auth_router.post("/login")
async def login(request: LoginRequest):
    user = users_collection.find_one({"username": request.username})
    
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Check and add default preferences if not present
    default_preferences = {
        "userRole": "Student",
        "timeValue": 15,
        "language": "English",
        "ageGroup": "Above 18"
    }
    
    if not user.get("preferences"):
        users_collection.update_one(
            {"username": request.username},
            {"$set": {"preferences": default_preferences}}
        )
        user["preferences"] = default_preferences

    # Ensure stats exist
    if not user.get("stats"):
        default_stats = {
            "totalGoals": 0,
            "completedGoals": 0,
            "totalQuizzes": 0,
            "averageScore": 0,
            "streakDays": 0,
            "totalStudyTime": 0
        }
        users_collection.update_one(
            {"username": request.username},
            {"$set": {"stats": default_stats}}
        )
        user["stats"] = default_stats

    token = create_jwt_token(request.username)
    return {
        "token": token, 
        "username": request.username, 
        "preferences": user["preferences"], 
        "name": user["name"]
    }

# Get User Profile Endpoint
@auth_router.get("/profile")
async def get_user_profile(username: str = Query(...)):
    try:
        user = users_collection.find_one({"username": username})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Calculate real-time stats from chat collection
        chat_session = chats_collection.find_one({"username": username})
        learning_goals = chat_session.get("learning_goals", []) if chat_session else []
        
        # Calculate stats
        total_goals = len(learning_goals)
        completed_goals = sum(1 for goal in learning_goals if goal.get("progress", 0) >= 100)
        
        # Count quiz messages in chat history
        messages = chat_session.get("messages", []) if chat_session else []
        quiz_messages = [msg for msg in messages if "quiz" in msg.get("content", "").lower()]
        total_quizzes = len(quiz_messages)
        
        # Update user stats
        updated_stats = {
            "totalGoals": total_goals,
            "completedGoals": completed_goals,
            "totalQuizzes": total_quizzes,
            "averageScore": user.get("stats", {}).get("averageScore", 0),
            "streakDays": user.get("stats", {}).get("streakDays", 0),
            "totalStudyTime": user.get("stats", {}).get("totalStudyTime", 0)
        }
        
        users_collection.update_one(
            {"username": username},
            {"$set": {"stats": updated_stats}}
        )

        return {
            "name": user["name"],
            "username": user["username"],
            "preferences": user.get("preferences", {}),
            "stats": updated_stats,
            "created_at": user.get("created_at")
        }
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user profile")