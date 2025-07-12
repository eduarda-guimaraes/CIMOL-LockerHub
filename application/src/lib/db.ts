// application/src/lib/db.ts
import mongoose, { Mongoose } from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    "Por favor, defina a variável de ambiente MONGO_URI dentro de .env.local"
  );
}

// --- MODIFICAÇÃO AQUI: Removendo 'any' e tipando o cache global ---

// 1. Definir a interface para nosso cache
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// 2. Estender a interface global do NodeJS para incluir nossa variável de cache
declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGO_URI!, opts)
      .then((mongooseInstance) => {
        console.log("✅ Nova conexão com o MongoDB estabelecida.");
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ Erro ao conectar ao MongoDB:", e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
