# AI Tutor - Intelligent Learning Platform

[![AI Tutor Logo](https://res.cloudinary.com/srvraj311/image/upload/c_scale,w_346/v1743788747/Group_4_n7afsr.png)](https://eduverse-backend-lqj5.onrender.com/)

**AI Tutor** is an advanced AI-powered learning platform that creates personalized study plans and provides intelligent tutoring assistance. Built with modern web technologies and powered by **LLaMA 3 70B** via the **Groq API**, it offers a seamless learning experience with real-time chat, progress tracking, and adaptive learning paths.

## 🌟 Key Features

✅ **AI-Powered Learning Paths** - Generate structured, personalized study plans based on user preferences  
✅ **Intelligent Chat Interface** - Real-time streaming responses with markdown support  
✅ **User Authentication & Profiles** - Secure login with personalized preferences  
✅ **Progress Tracking** - Comprehensive statistics and achievement system  
✅ **Interactive Assessments** - Quiz generation and progress evaluation  
✅ **Responsive Design** - Optimized for desktop, tablet, and mobile devices  
✅ **Dark/Light Theme** - Modern UI with theme switching capability  
✅ **Learning Goals Management** - Save, track, and manage multiple learning objectives  

---

## 🛠 Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | React.js + Vite | 19.0.0 |
| **Backend** | FastAPI (Python) | 0.104.1 |
| **Database** | MongoDB | 4.6.0 |
| **AI Model** | LLaMA 3 70B (Groq API) | 0.28.0 |
| **Styling** | Bootstrap + SCSS | 5.3.3 |
| **State Management** | Redux Toolkit | 2.6.1 |
| **Authentication** | JWT + bcrypt | - |
| **Deployment** | Render (Backend) + Vercel (Frontend) | - |

---

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │   MongoDB Atlas  │
│                 │    │                 │    │                 │
│ • Dashboard     │◄──►│ • Authentication│◄──►│ • User Data     │
│ • Chat Interface│    │ • Chat API      │    │ • Chat History  │
│ • Learning Paths│    │ • Learning Mgmt │    │ • Learning Goals│
│ • Progress Track│    │ • Statistics    │    │ • Preferences   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   Groq API      │
         │              │                 │
         └──────────────┤ • LLaMA 3 70B   │
                        │ • JSON Generation│
                        │ • Streaming Chat │
                        └─────────────────┘
```

### Data Flow

1. **User Interaction** → User submits learning query through React interface
2. **Authentication** → JWT token validation and user context retrieval
3. **AI Processing** → Query enhancement and LLaMA 3 70B API call via Groq
4. **Response Handling** → Streaming chat responses or structured learning path JSON
5. **Data Persistence** → Save learning goals, chat history, and user progress to MongoDB
6. **UI Updates** → Real-time updates with Redux state management

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Python** 3.9+ with pip
- **MongoDB** instance (local or cloud)
- **Groq API Key** for LLaMA access

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/ai-tutor.git
cd ai-tutor
```

### 2️⃣ Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and Groq API key

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3️⃣ Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4️⃣ Environment Variables
Create a `.env` file in the root directory:
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_tutor

# AI API
API_KEY=your_groq_api_key_here
MODEL_NAME=llama3-70b-8192

# Authentication
JWT_SECRET=your_jwt_secret_key_here
```

---

## 📱 Application Features

### 🎯 Dashboard
- **Welcome Section** - Personalized greeting with quick actions
- **Progress Cards** - Visual representation of learning statistics
- **Course Overview** - Active learning goals and completion status
- **Quick Stats** - Total goals, completed courses, quiz scores, and study streaks

### 💬 AI Chat Interface
- **Streaming Responses** - Real-time AI responses with typing indicators
- **Markdown Support** - Rich text formatting for better readability
- **Learning Path Mode** - Generate structured study plans with JSON output
- **Quiz Mode** - Interactive assessment creation and scoring
- **Chat History** - Persistent conversation storage and retrieval

### 📚 Learning Management
- **Personalized Paths** - AI-generated study plans based on user preferences
- **Goal Tracking** - Save, update, and monitor learning objectives
- **Progress Monitoring** - Visual progress bars and completion tracking
- **Resource Links** - Curated learning materials and video content

### 📊 Analytics & Progress
- **Study Statistics** - Time spent, goals completed, quiz scores
- **Achievement System** - Badges and milestones for motivation
- **Streak Tracking** - Daily learning consistency monitoring
- **Assessment History** - Quiz results and performance analytics

### 🎨 User Experience
- **Responsive Design** - Optimized for all device sizes
- **Theme Switching** - Dark/light mode with smooth transitions
- **Optimized Sidebar** - Clean navigation with improved alignment
- **Accessibility** - WCAG compliant with keyboard navigation support

---

## 🔧 API Endpoints

### Authentication
```http
POST /auth/signup     # User registration
POST /auth/login      # User authentication
GET  /auth/profile    # Get user profile
```

### Chat & Learning
```http
POST /chat/ask                # Send chat message
GET  /chat/history           # Get chat history
POST /chat/save-path         # Save learning path
GET  /chat/get-all-goals     # Get learning goals
PUT  /chat/update-goal       # Update learning goal
DELETE /chat/delete-goal     # Delete learning goal
GET  /chat/user-stats        # Get user statistics
GET  /chat/assessments       # Get assessment history
POST /chat/save-preferences  # Save user preferences
DELETE /chat/clear           # Clear chat history
```

---

## 🎨 UI/UX Improvements

### Recent Enhancements
- ✅ **Fixed Landing Page** - Removed blank space below header
- ✅ **Optimized Sidebar** - Better alignment and removed unnecessary "Navigation" text
- ✅ **Enhanced Animations** - Smooth transitions and hover effects
- ✅ **Improved Responsiveness** - Better mobile and tablet experience
- ✅ **Icon Compatibility** - Fixed react-bootstrap-icons import issues
- ✅ **Theme Consistency** - Unified color scheme across components

### Design System
- **Typography** - Inter font family with consistent weight hierarchy
- **Color Palette** - Modern blue gradient with accessible contrast ratios
- **Spacing** - 8px grid system for consistent layout
- **Components** - Reusable cards, buttons, and form elements
- **Animations** - Cubic-bezier transitions for smooth interactions

---

## 🚀 Deployment

### Backend (Render)
```yaml
# render.yaml
services:
  - type: web
    name: ai-tutor-backend
    env: python
    buildCommand: |
      pip install -r requirements.txt
      cd frontend && npm install && npm run build
    startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT"
```

### Frontend (Vercel)
```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ]
}
```

---

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core AI chat functionality
- ✅ Learning path generation
- ✅ User authentication
- ✅ Progress tracking

### Phase 2 (Next)
- 🔄 Advanced quiz system with auto-grading
- 🔄 Multi-language support expansion
- 🔄 Collaborative learning features
- 🔄 Mobile app development

### Phase 3 (Future)
- 📋 Integration with external learning platforms
- 📋 Advanced analytics and insights
- 📋 AI-powered content recommendations
- 📋 Voice interaction capabilities

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- 📧 **Email**: sourabhraj311@gmail.com
- 🌐 **Website**: [AI Tutor Platform](https://eduverse-backend-lqj5.onrender.com/)
- 📚 **Documentation**: [API Docs](https://eduverse-backend-lqj5.onrender.com/docs)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/ai-tutor/issues)

---

## 🙏 Acknowledgments

- **Groq** for providing access to LLaMA 3 70B API
- **MongoDB Atlas** for reliable database hosting
- **Render & Vercel** for seamless deployment platforms
- **React & FastAPI** communities for excellent documentation
- **Bootstrap** for responsive design components

---

<div align="center">

**Built with ❤️ for learners worldwide**

[⭐ Star this repo](https://github.com/your-username/ai-tutor) | [🐛 Report Bug](https://github.com/your-username/ai-tutor/issues) | [💡 Request Feature](https://github.com/your-username/ai-tutor/issues)

</div>