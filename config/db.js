import mongoose from 'mongoose';

// Check for existing connection cache in global
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Function to connect to the database
async function connectDB() {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection is being made yet, start connecting
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    //  FIXED: removed `await` before assigning `.then(...)`
    cached.promise = mongoose.connect(`${process.env.MONGODB_URI}/quickcart`, opts);
  }

  // Await the promise once and cache the result
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
