import clientPromise from './mongodb';
import { Recording, Tag, User, Comment } from './models';
import { ObjectId, Document } from 'mongodb';

const dbName = 'leaf-to-forest';

export async function getCollection<T extends Document>(collectionName: string) {
  const client = await clientPromise;
  const db = client.db(dbName);
  return db.collection<T>(collectionName);
}

// 录音相关操作
export async function getRecordings() {
  try {
    console.log('开始获取录音列表...');
    const collection = await getCollection<Recording>('recordings');
    const recordings = await collection.find().sort({ date: -1 }).toArray();
    console.log('获取到的录音列表:', recordings);
    return recordings;
  } catch (error) {
    console.error('获取录音列表失败:', error);
    return [];
  }
}

export async function getRecordingById(id: string) {
  try {
    if (!id) {
      console.error('录音ID不能为空');
      return null;
    }

    const collection = await getCollection<Recording>('recordings');
    const recording = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!recording) {
      console.log(`未找到ID为 ${id} 的录音`);
      return null;
    }

    return recording;
  } catch (error) {
    console.error('获取录音详情失败:', error);
    return null;
  }
}

export async function createRecording(recording: Omit<Recording, '_id'>) {
  try {
    const collection = await getCollection<Recording>('recordings');
    const result = await collection.insertOne({
      ...recording,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  } catch (error) {
    console.error('创建录音失败:', error);
    throw error;
  }
}

// 标签相关操作
export async function getTags() {
  const collection = await getCollection<Tag>('tags');
  return collection.find().toArray();
}

export async function createTag(tag: Omit<Tag, '_id'>) {
  const collection = await getCollection<Tag>('tags');
  const result = await collection.insertOne({
    ...tag,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result;
}

// 用户相关操作
export async function getUserByEmail(email: string) {
  const collection = await getCollection<User>('users');
  return collection.findOne({ email });
}

export async function createUser(user: Omit<User, '_id'>) {
  const collection = await getCollection<User>('users');
  const result = await collection.insertOne({
    ...user,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result;
}

// 评论相关操作
export async function getCommentsByRecordingId(recordingId: string) {
  const collection = await getCollection<Comment>('comments');
  return collection
    .find({ recordingId: new ObjectId(recordingId) })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function createComment(comment: Omit<Comment, '_id'>) {
  const collection = await getCollection<Comment>('comments');
  const result = await collection.insertOne({
    ...comment,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result;
} 