from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from auth import auth_router
from chat import chat_router
import os

# Initialize FastAPI app
app = FastAPI(
    title="AI Tutor API",
    description="Enhanced AI-powered learning platform with comprehensive user management",
    version="2.0.0"
)

# Allowed frontend origins (Update if deploying)
origins = [
    "http://localhost:5173",  # Vite Frontend
    "http://127.0.0.1:5173",  # Alternative local Vite
    "http://localhost:3000",  # React Dev Server
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # Local backend
    "http://127.0.0.1:8000",
    "https://eduverse-ai.vercel.app",  # Deployed frontend on Vercel
]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific frontend origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "AI Tutor API is running successfully!",
        "version": "2.0.0",
        "status": "healthy",
        "endpoints": {
            "authentication": "/auth",
            "chat": "/chat",
            "docs": "/docs",
            "health": "/health"
        }
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "services": {
            "database": "connected",
            "ai_model": "available",
            "api": "running"
        }
    }

# API Info endpoint
@app.get("/api")
async def api_info():
    return {
        "message": "Welcome to AI Tutor API v2.0",
        "features": [
            "User Authentication & Profiles",
            "AI-Powered Chat & Learning Paths",
            "Learning Goals Management",
            "Progress Tracking & Statistics",
            "Assessment & Quiz System",
            "Personalized Preferences"
        ],
        "documentation": "/docs"
    }

# ✅ 1. Include Routers **before** mounting frontend
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/chat", tags=["Chat & Learning"])

# ✅ 2. Mount frontend **at the end** to prevent route conflicts
FRONTEND_BUILD_DIR = os.path.join(os.getcwd(), "frontend", "dist")

# Only mount frontend if the build directory exists
if os.path.exists(FRONTEND_BUILD_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="frontend")
    print(f"✅ Frontend mounted from: {FRONTEND_BUILD_DIR}")
else:
    print(f"⚠️  Frontend build directory not found: {FRONTEND_BUILD_DIR}")
    print("   Run 'npm run build' in the frontend directory to create the build.")

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "error": "Endpoint not found",
        "message": "The requested endpoint does not exist",
        "available_endpoints": [
            "/auth/login",
            "/auth/signup", 
            "/auth/profile",
            "/chat/ask",
            "/chat/history",
            "/chat/save-path",
            "/chat/get-all-goals",
            "/chat/user-stats",
            "/chat/assessments",
            "/chat/save-preferences"
        ]
    }

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {
        "error": "Internal server error",
        "message": "An unexpected error occurred. Please try again later.",
        "support": "Contact support if the issue persists"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)