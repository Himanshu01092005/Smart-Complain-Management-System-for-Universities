const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to the database when the server starts
connectDB();
// -------------------------


const app = express();

//  Add this line to allowing requests from other origins(read agian about cors)
app.use(cors());


// !!! IMPORTANT: Add this middleware to parse JSON bodies !!!
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.send('Smart Complaint System API is running...');
});

// --- Use the new user routes ---
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
// ------------------------------



const complaintRoutes = require('./routes/complaintRoutes'); // Add this line
app.use('/api/complaints', complaintRoutes); // Add this line



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running successfully on port http://localhost:${PORT}`);
});