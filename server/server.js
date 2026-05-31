const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');

require('dotenv').config();

const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://mern-task-app-iota.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);

require('./scheduler');

app.get('/', (req, res) => {
  res.send('MERN Task AUTOMATION API IS RUNNING');
});

mongoose
.connect(process.env.MONGO_URI)
.then(()=> {
  console.log('MongoDB connected');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
})
.catch((err) => console.log('MongoDB connection error:',err));