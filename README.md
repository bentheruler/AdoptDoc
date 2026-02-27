# AdoptDoc Project - Theme Integration

This document outlines the integration of JSON Resume themes into the AdoptDoc project, enabling dynamic theme application for resumes and documents.

## Features

- **Document Management**: Create, edit, version history, preview.
- **Templating**: Use predefined templates to generate documents.
- **AI Integration**: AI-powered document processing and analysis.
- **JSON Resume Theme Integration**: Dynamically render documents using various JSON Resume themes.
- **Authentication & Authorization**: Secure user access with role-based control.
- **Admin Dashboard**: For managing users and system settings.

## Project Structure

- **client/**: React Frontend application.
- **server/**: Node.js + Express Backend application.
  - **services/resumeRenderService.js**: New service to handle resume rendering with themes.
  - **services/pdfService.js**: Updated to handle PDF generation logic moved from routes.
  - **routes/documentRoutes.js**: Updated to include preview and PDF export endpoints.

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- MongoDB

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AdoptDoc
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```
   **Install theme and PDF generation packages:**
   ```bash
   npm install jsonresume-theme-elegant jsonresume-theme-flat jsonresume-theme-kendall puppeteer
   ```
   (Check available themes at: https://www.npmjs.com/search?q=jsonresume-theme)

3. **Install client dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables

Create `.env` files in the `server/` and `client/` directories and configure the following variables:

**`server/.env`**:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**`client/.env`**:
```
REACT_APP_API_URL=http://localhost:5000/api  # Or your backend API URL
```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev # or npm start
   ```

2. **Start the frontend development server:**
   ```bash
   cd client
   npm start
   ```

The application should be accessible at `http://localhost:3000` (client) and your API will be running on `http://localhost:5000` (server).

## Theme Integration Flow

1. **User Interaction**: User fills a conversational form.
2. **AI Generation**: AI generates a JSON Resume-compatible object.
3. **Data Storage**: JSON is saved to MongoDB (`document.content`).
4. **Backend Rendering**: The backend renders HTML using the chosen theme via `resumeRenderService.js`.
5. **Frontend Preview**: The frontend displays a live preview in an `<iframe>` using `DocumentPreview.jsx`.
6. **PDF Download**: On user request, Puppeteer in `pdfService.js` converts HTML to PDF.

## AI Prompt Engineering

Ensure your AI prompt ends with a clear instruction to output JSON adhering to the JSON Resume schema:

```
Return ONLY a valid JSON object that strictly follows the JSON Resume schema (https://jsonresume.org/schema). Do not include any explanation or markdown.
```

## Tech Stack

- **Frontend**: React, React Router, Axios, Tailwind CSS
- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs, dotenv, morgan, multer, rate-limiter-flexible, puppeteer, jsonresume-theme-*
- **Database**: MongoDB

## Contributing

Contributions are welcome! Please refer to the `CONTRIBUTING.md` file (if available) for guidelines.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
