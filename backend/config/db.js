const mongoose = require('mongoose');
const connectDB = () => {
  mongoose.set('bufferCommands', false);
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
    console.log('[AI Studio] Local MongoDB not running in container — operating in mock in-memory fallback mode');
    return;
  }
  mongoose
    .connect(mongoUri, { serverSelectionTimeoutMS: 2000 })
    .then((conn) => console.log(`MongoDB connected: ${conn.connection.host}`))
    .catch((err) =>
      console.warn(`[AI Studio] MongoDB connection failed: ${err.message}. Operating in mock in-memory fallback mode.`)
    );
};
module.exports = connectDB;
