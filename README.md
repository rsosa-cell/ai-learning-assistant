# 🧠 AI Learning Assistant

An AI-powered study platform that transforms documents into interactive learning experiences using quizzes, flashcards, summaries, and an AI chat assistant.

Built as a full-stack application with **React, Node.js, Express, MongoDB, and Google Gemini AI**, focusing on intelligent content processing and personalized learning.

---

## 🎥 Demo

👉 Video Demo:  
https://www.youtube.com/watch?v=Jn9lGxTmRb8

---

## 📸 Screenshots

## 📸 Screenshots

| Document | Upload |
|----------|--------|
| ![](./screenshots/Document.png) |

| Summary | Quiz |
|--------|------|
| ![](./screenshots/Summary.png) | ![](./screenshots/Quiz.png) |

| Flashcards | Chat |
|------------|------|
| ![](./screenshots/Flashcards.png) | ![](./screenshots/Chat.png) |
---

## 🚀 Features

### 📄 Document Intelligence
- Upload PDFs or text-based documents
- Automatic text extraction and chunking
- AI-ready preprocessing pipeline

### 🤖 AI Learning Tools
- Generate quizzes from study material
- Create flashcards for active recall
- Summarize large documents into key points
- Explain concepts using AI chat

### 🧠 Quiz System
- Dynamic multiple-choice questions
- Instant scoring and evaluation
- Detailed answer review with explanations

### 💬 AI Chat Assistant
- Ask questions about uploaded documents
- Context-aware responses using relevant text chunks
- Persistent chat history per document

### 🔐 Authentication System
- Secure JWT-based login/register
- Protected user routes
- User-specific document isolation

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Tailwind CSS
- Axios
- React Hot Toast
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)

### AI Layer
- Google Gemini API
- Custom chunking + retrieval system
- Context-aware prompt engineering

---

## 🧠 System Architecture

1. User uploads document  
2. Backend extracts text content  
3. Text is split into semantic chunks  
4. AI processes chunks using Gemini API  
5. Features generated:
   - Quizzes
   - Flashcards
   - Summaries
   - Chat responses  
6. Data stored per user in MongoDB

---

## 📁 Project Structure
backend
frontend
---

## ⚙️ Environment Variables

### Backend `.env`
MONGO_URI=your_mongodb_connection
, JWT_SECRET=your_secret_key
, GEMINI_API_KEY=your_api_key

---
