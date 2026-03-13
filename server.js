require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');


const app = express();

const cors = require("cors");

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

app.use('/api/auth', require('./routes/auth'));


app.get('/', (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});