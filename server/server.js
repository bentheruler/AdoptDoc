// server/server.js
// Server entry point for the backend.
const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to Database
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("MongoDB Connected Successfully!"))
    .catch(err => console.error("MongoDB Connection Error:", err.message));
} else {
  console.warn("MONGODB_URI not found in environment. Database not connected.");
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
