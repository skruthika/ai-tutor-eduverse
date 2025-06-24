# AI Tutor - Enhanced Learning Management System

## 🚀 Quick Start

### Running the Backend

**Option 1: Using the startup script (Recommended)**
```bash
python start_server.py
```

**Option 2: Using uvicorn directly**
```bash
uvicorn main_enhanced:app --host 0.0.0.0 --port 8000 --reload
```

**Option 3: Using the main file (Not recommended for development)**
```bash
python main_enhanced.py
```

### Environment Setup

1. **Copy the environment template:**
```bash
cp .env.example .env
```

2. **Configure your environment variables in `.env`:**

**Required:**
```env
# MongoDB Configuration
MONGO_URI=your_mongodb_connection_string_here
DATABASE_NAME=ai_tutor_enhanced

# Groq API Configuration
API_KEY=your_groq_api_key_here
MODEL_NAME=llama3-70b-8192

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
```

**Optional (for file upload features):**
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

### AWS S3 Setup (Optional)

If you want to enable file upload and avatar generation features:

1. **Create an AWS S3 bucket**
2. **Create an IAM user with S3 permissions**
3. **Add the credentials to your `.env` file**

**Required S3 Permissions:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### Features

✅ **Core Features (Always Available):**
- AI-powered chat and learning paths
- User authentication and profiles
- Learning goals management
- Quiz system
- Progress tracking

✅ **Enhanced Features (Requires AWS S3):**
- File upload (images, audio, video)
- Avatar image upload
- Avatar video generation
- Cloud storage for user content

### Troubleshooting

**Warning: "You must pass the application as an import string"**
- Use `python start_server.py` instead of `python main_enhanced.py`

**Warning: "AWS S3 credentials not fully configured"**
- This is normal if you haven't set up AWS S3 yet
- File upload features will be disabled but the app will work normally
- Set up AWS S3 credentials in `.env` to enable file uploads

**Database Connection Issues:**
- Make sure MongoDB is running
- Check your `MONGO_URI` in the `.env` file
- Ensure the database name is correct

### API Documentation

Once the server is running, visit:
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health
- **API Info:** http://localhost:8000/api

### Development

For development with auto-reload:
```bash
python start_server.py
```

The server will automatically restart when you make changes to the code.