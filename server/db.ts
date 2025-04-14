import mongoose from 'mongoose';

// MongoDB connection string - use a local fallback if no environment variable is set
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

// Configure Mongoose
mongoose.set('strictQuery', false);

// Set up connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI, options)
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    // Instead of exiting, retry the connection
    setTimeout(() => {
      mongoose.connect(MONGODB_URI, options)
        .then(() => console.log('Successfully connected to MongoDB on retry'))
        .catch(err => {
          console.error('MongoDB connection retry failed:', err);
          process.exit(1);
        });
    }, 5000);
  });

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Export the db connection for use in other files
export const db = mongoose.connection;
export default db;
