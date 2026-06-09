# AI PDF Study Assistant

AI PDF Study Assistant is a full stack web application designed to help users study and understand PDF documents more efficiently. The system allows users to upload PDF files, extract readable text, ask questions based on uploaded documents, generate structured summaries, save chat history and manage users and documents through an admin dashboard.

This project was developed using React, Node.js, Express.js, and SQLite. It provides a clean, responsive, and user friendly interface for document based learning.

---

## Project Overview

The main purpose of this project is to create an intelligent study assistant that helps users interact with PDF documents in a simple and effective way. Instead of reading an entire PDF manually, users can upload the document, ask questions from its content, generate summaries with selected word limits and review previous chat or summary history.

The system uses PDF text extraction, keyword based document search, sentence scoring and structured summarization techniques to provide useful responses based on uploaded document content.

---

## Features

* User registration and login
* JWT-based authentication
* Protected user dashboard
* PDF upload functionality
* PDF text extraction
* Document preview display
* PDF-based question answering
* Improved keyword-based answer generation
* Structured PDF summarization
* Summary word count selection: 100, 200, 300, and 500 words
* Separate summarization interface
* Summary history management
* Delete generated summaries
* Chat history management
* Admin dashboard
* User and document management
* Responsive and professional UI

---

## Technologies Used

### Frontend

* React
* Vite
* React Router DOM
* Axios
* CSS

### Backend

* Node.js
* Express.js
* SQLite
* better-sqlite3
* JWT
* bcryptjs
* Multer
* pdf-parse

### Tools

* VS Code
* Postman
* Git
* GitHub

---

## Project Structure

```text
ai-pdf-study-assistant/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UploadPDF.jsx
│   │   │   ├── ChatPDF.jsx
│   │   │   ├── SummerizePDF.jsx
│   │   │   ├── History.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── sqlite.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── documentController.js
│   │   │   ├── chatController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── services/
│   │   │   ├── pdfService.js
│   │   │   ├── searchService.js
│   │   │   └── summaryService.js
│   │   ├── scripts/
│   │   │   └── makeAdmin.js
│   │   └── server.js
│   │
│   ├── database/
│   ├── uploads/
│   ├── .env
│   └── package.json
│
├── screenshots/
├── README.md
└── .gitignore
```

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-pdf-study-assistant.git
cd ai-pdf-study-assistant
```

---

## Backend Setup

Go to the server folder:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key_here
```

Run the backend server:

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

---

## Frontend Setup

Open another terminal and go to the client folder:

```bash
cd client
```

Install frontend dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## How to Use the Application

1. Register a new account.
2. Login using email and password.
3. Open the dashboard.
4. Upload a text-based PDF document.
5. View uploaded PDF documents.
6. Open the PDF chat interface.
7. Ask questions from the uploaded PDF.
8. Open the Summarize page.
9. Select a PDF and choose summary word count.
10. Generate a structured summary.
11. View summary history.
12. Delete summaries if needed.
13. View saved chat history.
14. Admin users can manage users and documents.

---

## API Endpoints

### Authentication APIs

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Document APIs

```text
POST   /api/documents/upload
GET    /api/documents/my-documents
GET    /api/documents/:id
DELETE /api/documents/:id
```

### Summary APIs

```text
POST   /api/documents/:id/summarize
GET    /api/documents/summaries/history
DELETE /api/documents/summaries/:summaryId
```

### Chat APIs

```text
POST   /api/chat/ask
GET    /api/chat/:documentId
GET    /api/chat/history/all
DELETE /api/chat/:documentId
```

### Admin APIs

```text
GET    /api/admin/stats
GET    /api/admin/users
GET    /api/admin/documents
DELETE /api/admin/users/:id
DELETE /api/admin/documents/:id
```

---

## Admin Setup

To make a registered user an admin, run this command inside the `server` folder:

```bash
node src/scripts/makeAdmin.js useremail@gmail.com
```

After running the command, login again using the same account. The admin dashboard will be available for admin users.

---

## Important Notes

* This project uses SQLite as the local database.
* Uploaded files are stored inside the `server/uploads` folder.
* The SQLite database file is stored inside the `server/database` folder.
* Scanned image-based PDFs may not extract text correctly.
* For best results, upload text-based PDF files where text can be selected and copied.
* The project currently uses keyword-based document search and sentence scoring for answers and summaries.
* Future improvements can include embeddings, vector search, and LLM-based answer generation.

---

## Future Improvements

* Add OpenAI or other LLM-based answer generation
* Add semantic search using embeddings
* Add vector database support
* Add PDF page number references
* Add export summary as PDF
* Add dark mode
* Add Docker setup
* Add cloud deployment
* Add OCR support for scanned PDFs


This project is open-source and available for learning and development purposes.
