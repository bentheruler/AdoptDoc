# AdoptDoc Project

This project is a document management system with AI capabilities, allowing users to create, edit, and manage documents. It also supports document templating and AI-powered features for document processing.

## Features

- **Document Management**: Create, edit, version history, preview.
- **Templating**: Use predefined templates to generate documents.
- **AI Integration**: AI-powered document processing and analysis.
- **Authentication & Authorization**: Secure user access with role-based control.
- **Admin Dashboard**: For managing users and system settings.

## Project Structure

- **client/**: React Frontend application.
- **server/**: Node.js + Express Backend application.

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

## Tech Stack

- **Frontend**: React, React Router, Axios, Tailwind CSS
- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs, dotenv, morgan, multer, rate-limiter-flexible
- **Database**: MongoDB

## Contributing

Contributions are welcome! Please refer to the `CONTRIBUTING.md` file (if available) for guidelines.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
