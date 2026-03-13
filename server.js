require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.send("API Running...");
});

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

