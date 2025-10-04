
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Income = require('./src/models/Income');
const Expense = require('./src/models/Expense');
const authController = require('./src/controllers/authController');
const auth = require('./src/middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB:', err));

// Auth Routes (public routes)
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Protected Routes - require authentication
const pocketRoutes = require('./src/routes/pockets');
const incomeRoutes = require('./src/routes/income');
const expenseRoutes = require('./src/routes/expenses');
app.use('/api/pockets', pocketRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
