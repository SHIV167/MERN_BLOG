import mongoose from 'mongoose';

// MongoDB connection string - use a local fallback if no environment variable is set
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export const db = mongoose.connection;

// Export the db connection for use in other files
export default db;
