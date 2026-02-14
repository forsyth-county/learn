import mongoose from "mongoose";

// Hardcoded MongoDB URI as fallback
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://blakeflyz1_db_user:mEoHlE8fi7lVQeab@forsythtimestorage.n8i4ngt.mongodb.net/learnforsyth?retryWrites=true&w=majority&appName=ForsythTimeStorage";

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

const cached: GlobalMongoose = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
