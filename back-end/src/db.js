const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connectDb = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });

  const db = mongoose.connection;

  db.on('connected', () => {
    console.log('MongoDB connected');
  });

  db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  db.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  return db;
};

module.exports = connectDb;

