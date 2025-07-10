import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('请在 .env 文件中设置 DATABASE_URL');
}

const uri = process.env.DATABASE_URL;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // 在开发环境中使用全局变量，避免热重载时创建多个连接
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // 在生产环境中创建新连接
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;