"""
Server startup script - Use this to start the server properly
"""
import uvicorn
import os

if __name__ == "__main__":
    print("🚀 Starting AI Tutor Enhanced Backend v5.0...")
    print("📊 MongoDB Collections: users, chat_messages, learning_goals, quizzes, quiz_attempts, lessons, user_enrollments, user_sessions")
    print("🔗 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🛡️ Enhanced Security & Performance")
    print("📈 Real-time Analytics & Search")
    print("🗄️ AWS S3 File Storage Integration")
    print("🎬 Avatar Video Generation")
    print()
    print("💡 To configure AWS S3:")
    print("   1. Copy .env.example to .env")
    print("   2. Add your AWS credentials to .env")
    print("   3. Restart the server")
    print()
    
    uvicorn.run(
        "main_enhanced:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )