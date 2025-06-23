import os
import bcrypt
import logging
from jose import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Request, Response, status, Body
from pydantic import BaseModel, EmailStr, Field
from database import users_collection
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

class ProfileUpdateRequest(BaseModel):
    username: str
    name: str = None
    profile_picture: str = None

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
        raise HTTPException("User already exists")

    hashed_password = hash_password(request.password)

    # Default Preferences
    default_preferences = {
        "userRole": "Student",
        "timeValue": 15,
        "language": "English",
        "ageGroup": "Under 10"
    }

    users_collection.insert_one({
        "name": request.name,
        "username": request.username,
        "password": hashed_password,
        "preferences": default_preferences
    })

    return {"message": "User registered successfully with default preferences"}

# Login Endpoint
@auth_router.post("/login")
async def login(request: LoginRequest):
    user = users_collection.find_one({"username": request.username})
    
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException("No user exists with this mail")

    # Check and add default preferences if not present
    default_preferences = {
        "userRole": "Student",
        "timeValue": 15,
        "language": "English",
        "ageGroup": "Under 10"
    }
    
    if not user.get("preferences"):
        users_collection.update_one(
            {"username": request.username},
            {"$set": {"preferences": default_preferences}}
        )
        user["preferences"] = default_preferences

    token = create_jwt_token(request.username)
    return {"token": token, "username": request.username, "preferences": user["preferences"], "name": user["name"]}

# Get User Profile
@auth_router.get("/profile")
async def get_user_profile(username: str):
    """
    Retrieve user profile information
    """
    try:
        # Find the user in the database
        user = users_collection.find_one({"username": username})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Remove sensitive information
        if "password" in user:
            del user["password"]
        
        # MongoDB returns an _id field that's not JSON serializable
        if "_id" in user:
            del user["_id"]
        
        return user
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user profile: {str(e)}"
        )

# Update User Profile
@auth_router.put("/profile")
async def update_user_profile(profile_data: ProfileUpdateRequest):
    """
    Update user profile information
    """
    try:
        username = profile_data.username
        
        # Find the user in the database
        user = users_collection.find_one({"username": username})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prepare update data (only include fields that are provided)
        update_data = {}
        if profile_data.name is not None:
            update_data["name"] = profile_data.name
        if profile_data.profile_picture is not None:
            update_data["profile_picture"] = profile_data.profile_picture
        
        # Only update if there are fields to update
        if update_data:
            users_collection.update_one(
                {"username": username},
                {"$set": update_data}
            )
            
            # Get the updated user data
            updated_user = users_collection.find_one({"username": username})
            
            # Remove sensitive information
            if "password" in updated_user:
                del updated_user["password"]
            
            # MongoDB returns an _id field that's not JSON serializable
            if "_id" in updated_user:
                del updated_user["_id"]
            
            return updated_user
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update were provided"
            )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}"
        )