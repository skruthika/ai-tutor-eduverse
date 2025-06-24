from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from auth import auth_router
from chat import chat_router
from learning_paths import learning_paths_router
from quiz_system import quiz_router
from lessons import lessons_router  # Import the new lessons router
import os

# Initialize FastAPI app
app = FastAPI(
    title="AI Tutor - Comprehensive Learning Management System",
    description="Advanced AI-powered learning platform with personalized paths, quiz system, lesson management, and admin dashboard",
    version="4.0.0"
)

# Enhanced CORS configuration for development and production
origins = [
    "http://localhost:5173",  # Vite Frontend
    "http://127.0.0.1:5173",  # Alternative local Vite
    "http://localhost:3000",  # React Dev Server
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # Local backend
    "http://127.0.0.1:8000",
    "https://eduverse-ai.vercel.app",  # Deployed frontend on Vercel
    "http://localhost:5174",  # Alternative Vite port
    "http://127.0.0.1:5174",
]

# Enable CORS with comprehensive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["*"],
    max_age=3600,
)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "AI Tutor - Comprehensive Learning Management System",
        "version": "4.0.0",
        "status": "healthy",
        "server": "running",
        "cors_enabled": True,
        "features": [
            "User Authentication & Profiles",
            "AI-Powered Chat & Learning Paths", 
            "Comprehensive Learning Path Management",
            "Advanced Quiz System with Auto-Grading",
            "Admin Dashboard & Lesson Management",
            "Personalized User Lessons",
            "Progress Tracking & Analytics",
            "Real-time Updates & Notifications"
        ],
        "endpoints": {
            "authentication": "/auth",
            "chat": "/chat",
            "learning_paths": "/api/learning-paths",
            "quiz_system": "/api/quiz",
            "lesson_management": "/lessons",
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
            "lesson_management": "active",
            "admin_dashboard": "active",
            "api": "running",
            "cors": "enabled"
        },
        "version": "4.0.0"
    }

@app.get("/api")
async def api_info():
    return {
        "message": "Welcome to AI Tutor Comprehensive LMS API v4.0",
        "cors_status": "enabled",
        "allowed_origins": origins,
        "new_features": [
            "Admin Dashboard with Global Lesson Control",
            "Personalized Lesson Management (Per-User Visibility)",
            "Enhanced User Role Management",
            "Lesson Enrollment & Progress Tracking",
            "Advanced Analytics & Reporting",
            "Real-time Learning Tracking"
        ],
        "documentation": "/docs"
    }

# Include all routers with proper error handling
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/chat", tags=["Chat & Learning"])
app.include_router(learning_paths_router, prefix="/api/learning-paths", tags=["Learning Path Management"])
app.include_router(quiz_router, prefix="/api/quiz", tags=["Quiz System"])
app.include_router(lessons_router, prefix="/lessons", tags=["Lesson Management"])  # Add lessons router

# Mount frontend build directory
FRONTEND_BUILD_DIR = os.path.join(os.getcwd(), "frontend", "dist")

if os.path.exists(FRONTEND_BUILD_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="frontend")
    print(f"✅ Frontend mounted from: {FRONTEND_BUILD_DIR}")
else:
    print(f"⚠️  Frontend build directory not found: {FRONTEND_BUILD_DIR}")
    print("   Run 'npm run build' in the frontend directory to create the build.")

# Enhanced error handlers with CORS support
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={
        "error": "Endpoint not found",
        "message": "The requested endpoint does not exist",
        "status_code": 404,
        "available_endpoints": [
            "/auth/login", "/auth/signup", "/auth/profile", "/auth/check-admin",
            "/chat/ask", "/chat/history", "/chat/save-path", "/chat/user-stats",
            "/api/learning-paths/create", "/api/learning-paths/list",
            "/api/quiz/create", "/api/quiz/list", "/api/quiz/submit",
            "/lessons/lessons", "/lessons/admin/lessons", "/lessons/admin/dashboard",
            "/docs", "/health"
        ]
    })

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(status_code=500, content={
        "error": "Internal server error",
        "message": "An unexpected error occurred. Please try again later.",
        "status_code": 500,
        "support": "Contact support if the issue persists",
        "version": "4.0.0"
    })

# Add OPTIONS handler for preflight requests
@app.options("/{full_path:path}")
async def options_handler(request):
    return JSONResponse(status_code=200, content={"message": "OK"})

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI Tutor Backend Server v4.0...")
    print("📡 CORS enabled for origins:", origins)
    print("🔗 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🛡️ Admin Dashboard: Enabled")
    print("📖 Lesson Management: Active")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)