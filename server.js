require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./server/app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("MongoDB Connected Successfully!"))
    .catch(err => console.error("MongoDB Connection Error:", err.message));
} else {
  console.warn("MONGODB_URI not found. Database not connected.");
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
