import os
import bcrypt
import requests
import logging
from jose import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Request, Response, status, Body
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr, Field
from database import users_collection
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Load environment variables
load_dotenv()

# Router for authentication
auth_router = APIRouter()

# JWT Secret
JWT_SECRET = os.getenv("JWT_SECRET")

# Google OAuth settings
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

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

class GoogleAuthRequest(BaseModel):
    code: str

class GoogleUserInfo(BaseModel):
    email: EmailStr
    name: str = Field(...)
    picture: str = None
    email_verified: bool = False

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

# Google OAuth Login URL
@auth_router.get("/google/login")
async def google_login():
    """
    Generate Google OAuth login URL
    """
    auth_url = "https://accounts.google.com/o/oauth2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "email profile",
        "access_type": "offline",
        "prompt": "consent",
        "include_granted_scopes": "true",
    }
    
    # Construct the authorization URL
    url_params = "&".join([f"{key}={value}" for key, value in params.items()])
    authorization_url = f"{auth_url}?{url_params}"
    
    return {"authorization_url": authorization_url}

# Google OAuth Callback
@auth_router.get("/google/callback")
async def google_callback(code: str, request: Request):
    """
    Handle the Google OAuth callback
    """
    try:
        # Exchange the authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI,
        }
        
        # Get tokens from Google
        response = requests.post(token_url, data=payload)
        if not response.ok:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get token from Google"
            )
        
        token_data = response.json()
        id_info = id_token.verify_oauth2_token(
            token_data["id_token"], 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Verify email
        if not id_info.get("email_verified"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not verified with Google"
            )
        
        # Get or create user in our database
        email = id_info["email"]
        user = users_collection.find_one({"username": email})
        
        # Default preferences for new users
        default_preferences = {
            "userRole": "Student",
            "timeValue": 15,
            "language": "English",
            "ageGroup": "Under 10"
        }
        
        if not user:
            # Create new user
            user_data = {
                "name": id_info.get("name", "Google User"),
                "username": email,
                "password": None,  # No password for OAuth users
                "google_id": id_info.get("sub"),
                "profile_picture": id_info.get("picture"),
                "preferences": default_preferences,
                "oauth_provider": "google"
            }
            users_collection.insert_one(user_data)
            user = user_data
        else:
            # Update existing user with latest Google data
            users_collection.update_one(
                {"username": email},
                {"$set": {
                    "google_id": id_info.get("sub"),
                    "profile_picture": id_info.get("picture"),
                    "oauth_provider": "google"
                }}
            )
            
            # Ensure user has preferences
            if not user.get("preferences"):
                users_collection.update_one(
                    {"username": email},
                    {"$set": {"preferences": default_preferences}}
                )
                user["preferences"] = default_preferences
        
        # Generate JWT token
        token = create_jwt_token(email)
        
        # Create frontend URL with token
        frontend_url = "http://localhost:5173"  # Update this for production
        redirect_url = f"{frontend_url}/oauth-callback?token={token}&username={email}&name={id_info.get('name', 'Google User')}"
        
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google authentication failed: {str(e)}"
        )

# Verify Google ID token directly from frontend
@auth_router.post("/google/verify")
async def verify_google_token(request: Request):
    """
    Verify Google ID token sent from frontend
    
    This endpoint accepts a Google ID token in the request body.
    The token can be sent as:
    - Plain text in the request body (Content-Type: text/plain)
    - JSON object with a 'token' field (Content-Type: application/json)
    - Form data with a 'token' field (Content-Type: application/x-www-form-urlencoded or multipart/form-data)
    """
    try:
        logging.info("Received Google token verification request")
        content_type = request.headers.get("content-type", "").lower()
        logging.info(f"Content-Type: {content_type}")
        logging.info(f"Request headers: {request.headers}")
        
        # Extract token based on content type
        if "text/plain" in content_type:
            # Read raw body as text for plain text requests
            token = await request.body()
            token = token.decode("utf-8")
            logging.info(f"Extracted token from plain text body, length: {len(token)}")
        elif "application/json" in content_type:
            # Parse JSON body for JSON requests
            json_data = await request.json()
            token = json_data.get("token")
            logging.info(f"Extracted token from JSON body: {token is not None}")
        else:
            # For form data or any other content type, try to get form data
            try:
                form_data = await request.form()
                token = form_data.get("token")
                logging.info(f"Extracted token from form data: {token is not None}")
            except Exception as e:
                # If form data extraction fails, try to read the raw body
                logging.warning(f"Form data extraction failed: {str(e)}, trying raw body")
                token = await request.body()
                token = token.decode("utf-8")
                logging.info(f"Extracted token from raw body, length: {len(token)}")
            
        # Validate token
        if not token:
            error_msg = "No token provided in request"
            logging.error(error_msg)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
            
        logging.info(f"Token length: {len(token)}")
        
        try:
            # Verify the token
            id_info = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                GOOGLE_CLIENT_ID
            )
            logging.info("Google token successfully verified")
            logging.info(f"Token info: {id_info.keys()}")
        except Exception as e:
            logging.error(f"Token verification error: {str(e)}")
            logging.error(f"Token first 20 chars: {token[:20]}...")
            logging.error(f"Token last 20 chars: {token[-20:]}...")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid Google token: {str(e)}"
            )
        
        # Verify email
        if not id_info.get("email_verified"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not verified with Google"
            )
        
        # Get or create user in our database
        email = id_info["email"]
        user = users_collection.find_one({"username": email})
        
        # Default preferences for new users
        default_preferences = {
            "userRole": "Student",
            "timeValue": 15,
            "language": "English",
            "ageGroup": "Under 10"
        }
        
        if not user:
            # Create new user
            user_data = {
                "name": id_info.get("name", "Google User"),
                "username": email,
                "password": None,  # No password for OAuth users
                "google_id": id_info.get("sub"),
                "profile_picture": id_info.get("picture"),
                "preferences": default_preferences,
                "oauth_provider": "google"
            }
            users_collection.insert_one(user_data)
            user = user_data
        else:
            # Update existing user with latest Google data
            users_collection.update_one(
                {"username": email},
                {"$set": {
                    "google_id": id_info.get("sub"),
                    "profile_picture": id_info.get("picture"),
                    "oauth_provider": "google"
                }}
            )
            
            # Ensure user has preferences
            if not user.get("preferences"):
                users_collection.update_one(
                    {"username": email},
                    {"$set": {"preferences": default_preferences}}
                )
                user["preferences"] = default_preferences
        
        # Generate JWT token
        token = create_jwt_token(email)
        
        return {
            "token": token, 
            "username": email, 
            "preferences": user.get("preferences", default_preferences),
            "name": id_info.get("name", "Google User")
        }
        
    except Exception as e:
        error_msg = f"Google token verification failed: {str(e)}"
        logging.error(error_msg)
        logging.exception("Full error details:")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
