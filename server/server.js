const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');

require('dotenv').config();

const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors({
  origin: '*',
  credentials: false,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);

require('./scheduler');

app.get('/', (req, res) => {
  res.send('MERN Task AUTOMATION API IS RUNNING');
});

// Keep Render server awake
const https = require('https');
setInterval(() => {
  https.get('https://mern-task-app-ebjk.onrender.com', (res) => {
    console.log('Keep-alive ping:', res.statusCode);
  }).on('error', (err) => {
    console.log('Keep-alive error:', err.message);
  });
}, 14 * 60 * 1000);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log('MongoDB connection error:', err));