from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from auth import auth_router
from chat import chat_router
from learning_paths import learning_paths_router
from quiz_system import quiz_router
import os

# Initialize FastAPI app
app = FastAPI(
    title="AI Tutor - Comprehensive Learning Management System",
    description="Advanced AI-powered learning platform with personalized paths, quiz system, and progress tracking",
    version="3.0.0"
)

# Allowed frontend origins
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
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "AI Tutor - Comprehensive Learning Management System",
        "version": "3.0.0",
        "status": "healthy",
        "features": [
            "User Authentication & Profiles",
            "AI-Powered Chat & Learning Paths", 
            "Comprehensive Learning Path Management",
            "Advanced Quiz System with Auto-Grading",
            "Progress Tracking & Analytics",
            "Real-time Updates & Notifications"
        ],
        "endpoints": {
            "authentication": "/auth",
            "chat": "/chat",
            "learning_paths": "/api/learning-paths",
            "quiz_system": "/api/quiz",
            "docs": "/docs",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "services": {
            "database": "connected",
            "ai_model": "available",
            "learning_paths": "active",
            "quiz_system": "active",
            "api": "running"
        },
        "version": "3.0.0"
    }

@app.get("/api")
async def api_info():
    return {
        "message": "Welcome to AI Tutor Comprehensive LMS API v3.0",
        "new_features": [
            "Learning Path Management System",
            "Advanced Quiz Creation & Taking",
            "Automated Grading & Feedback",
            "Progress Analytics & Reporting",
            "Real-time Learning Tracking",
            "Enhanced User Experience"
        ],
        "documentation": "/docs"
    }

# Include all routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/chat", tags=["Chat & Learning"])
app.include_router(learning_paths_router, prefix="/api/learning-paths", tags=["Learning Path Management"])
app.include_router(quiz_router, prefix="/api/quiz", tags=["Quiz System"])

# Mount frontend build directory
FRONTEND_BUILD_DIR = os.path.join(os.getcwd(), "frontend", "dist")

if os.path.exists(FRONTEND_BUILD_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="frontend")
    print(f"✅ Frontend mounted from: {FRONTEND_BUILD_DIR}")
else:
    print(f"⚠️  Frontend build directory not found: {FRONTEND_BUILD_DIR}")
    print("   Run 'npm run build' in the frontend directory to create the build.")

# Enhanced error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "error": "Endpoint not found",
        "message": "The requested endpoint does not exist",
        "available_endpoints": [
            "/auth/login", "/auth/signup", "/auth/profile",
            "/chat/ask", "/chat/history", "/chat/save-path",
            "/api/learning-paths/create", "/api/learning-paths/list",
            "/api/quiz/create", "/api/quiz/list", "/api/quiz/submit",
            "/docs", "/health"
        ]
    }

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {
        "error": "Internal server error",
        "message": "An unexpected error occurred. Please try again later.",
        "support": "Contact support if the issue persists",
        "version": "3.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)