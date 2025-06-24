# AI Tutor - Comprehensive Learning Management System

**AI Tutor** is an advanced AI-powered learning platform that creates personalized study plans, offers intelligent tutoring assistance, and includes a comprehensive **Admin Dashboard** for managing educational content. Built with modern web technologies and powered by **LLaMA 3 70B** via the **Groq API**, it offers a seamless and feature-rich learning experience.

## 🌟 Key Features

✅ **AI-Powered Learning Paths** - Generate structured, personalized study plans.  
✅ **Intelligent Chat Interface** - Real-time streaming responses with markdown support.  
✅ **Admin Dashboard** - Manage lessons, users, and view platform analytics.  
✅ **Personalized Lesson Management** - Create, edit, and assign lessons to users.  
✅ **User Authentication & Profiles** - Secure login with personalized preferences.  
✅ **Progress Tracking** - Comprehensive statistics and achievement system.  
✅ **Interactive Assessments** - AI-powered quiz generation and auto-grading.  
✅ **Responsive Design** - Optimized for all devices.  
✅ **Dark/Light Theme** - Modern UI with theme switching.  

---

## 🛠 Tech Stack

| Component | Technology | Version |
|---|---|---|
| **Frontend** | React.js + Vite | 19.0.0 |
| **Backend** | FastAPI (Python) | 4.0.0 |
| **Database** | MongoDB | 4.6.0 |
| **AI Model** | LLaMA 3 70B (Groq API) | 0.28.0 |
| **Styling** | Bootstrap + SCSS | 5.3.3 |
| **State Management** | Redux Toolkit | 2.6.1 |
| **Authentication** | JWT + bcrypt | - |
| **Deployment** | Render (Backend) + Vercel (Frontend) | - |

---

## 🏗 Architecture Overview

```
┌───────────────────┐   ┌───────────────────┐   ┌──────────────────┐
│   React Frontend  │   │   FastAPI Backend   │   │   MongoDB Atlas  │
│                   │   │                   │   │                  │
│ • Admin Dashboard │◄─►│ • Authentication  │◄─►│ • User Data      │
│ • Chat Interface  │   │ • Lesson Management │   │ • Lesson Content │
│ • Learning Paths  │   │ • Chat & Quiz API   │   │ • Chat History   │
│ • Progress Track  │   │ • User Statistics │   │ • Learning Goals │
└───────────────────┘   └───────────────────┘   └──────────────────┘
         │                        │
         │                        ▼
         │               ┌──────────────────┐
         │               │     Groq API     │
         │               │                  │
         └───────────────┤ • LLaMA 3 70B    │
                         │ • JSON Generation│
                         │ • Streaming Chat │
                         └──────────────────┘
```

### Data Flow

1.  **User Interaction** → User interacts with the React frontend (student or admin).
2.  **Authentication** → JWT token validation determines user role and permissions.
3.  **Admin Actions** → Admins manage lessons, view analytics, and oversee users.
4.  **AI Processing** → Student queries are enhanced and sent to the LLaMA 3 70B API.
5.  **Response Handling** → Streaming chat, quizzes, or structured learning paths are returned.
6.  **Data Persistence** → All data is stored in MongoDB Atlas.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Python** 3.9+ with pip
- **MongoDB** instance (local or cloud)
- **Groq API Key**

### 1️⃣ Clone Repository
'''bash
git clone https://github.com/your-username/ai-tutor.git
cd ai-tutor
'''

### 2️⃣ Backend Setup
'''bash
pip install -r requirements.txt
cp .env.example .env 
# Edit .env with your credentials
uvicorn main:app --reload
'''

### 3️⃣ Frontend Setup
'''bash
cd frontend
npm install
npm run dev
'''

---

## 👑 Admin Dashboard Features

The new Admin Dashboard provides centralized control over the platform:

-   **Lesson Management**: Create, edit, and delete global lessons for all users.
-   **User Overview**: View a list of all registered users and their statistics.
-   **Platform Analytics**: See real-time statistics on user activity, lesson creation, and more.
-   **Role-Based Access**: Secure endpoints ensure only authorized admins can perform administrative tasks.

---

## 🔧 API Endpoints

### Authentication
'''http
POST /auth/signup
POST /auth/login
GET  /auth/profile
'''

### Chat, Learning & Quizzes
'''http
POST   /chat/ask
GET    /chat/history
POST   /api/learning-paths/create
GET    /api/learning-paths/list
POST   /api/quiz/create
POST   /api/quiz/submit
'''

### Lesson Management (Admin & User)
'''http
GET    /lessons/admin/dashboard  # Admin: Get platform stats
GET    /lessons/admin/users      # Admin: Get all users
GET    /lessons/admin/lessons    # Admin: Get all lessons
POST   /lessons/admin/lessons    # Admin: Create a lesson
DELETE /lessons/admin/lessons/{id} # Admin: Delete a lesson
GET    /lessons/lessons          # User: Get available lessons
POST   /lessons/enroll           # User: Enroll in a lesson
PUT    /lessons/{id}/progress    # User: Update progress
'''
---

## 🎨 UI/UX Improvements

-   ✅ **Comprehensive UI Overhaul**: Fixed dozens of UI inconsistencies, icon import errors, and layout issues.
-   ✅ **Polished Landing Page & Dashboard**: Redesigned for a cleaner, more intuitive user experience.
-   ✅ **Optimized Responsiveness**: Enhanced compatibility for mobile and tablet devices.
-   ✅ **Improved Navigation**: Simplified sidebar and header for better usability.
-   ✅ **Consistent Theming**: Ensured dark/light mode themes are applied consistently.

---

## 🔮 Roadmap

### Phase 1 (Completed)
- ✅ Core AI Chat & Learning Path Generation
- ✅ User Authentication & Profile Management
- ✅ Interactive Quizzes & Progress Tracking
- ✅ Admin Dashboard & Lesson Management

### Phase 2 (Next)
- 🔄 Multi-Language Support
- 🔄 Collaborative Learning Features (Group Study)
- 🔄 Advanced Analytics & Reporting
- 🔄 Mobile App (React Native)

### Phase 3 (Future)
- 📋 Integration with External Learning Platforms (e.g., Coursera)
- 📋 AI-Powered Content Recommendations
- 📋 Voice-to-Text and Text-to-Voice Interaction
- 📋 Gamification and Rewards System

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo, create a feature branch, and open a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- **Groq** for LLaMA 3 70B API access.
- **MongoDB Atlas** for reliable database hosting.
- **Render & Vercel** for seamless deployment.
- **React & FastAPI** communities for excellent documentation.

---

<div align="center">

**Built with ❤️ for learners worldwide**

[⭐ Star this repo](https://github.com/your-username/ai-tutor) | [🐛 Report Bug](https://github.com/your-username/ai-tutor/issues) | [💡 Request Feature](https://github.com/your-username/ai-tutor/issues)

</div>
