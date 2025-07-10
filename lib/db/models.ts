import { ObjectId } from 'mongodb';

export interface Recording {
  _id?: ObjectId;
  date: Date;
  title: string;
  audioUrl: string;
  transcription: string;
  background: string;
  participants: string[];
  tags: string[];
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  _id?: ObjectId;
  name: string;
  description?: string;
  recordings: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id?: ObjectId;
  recordingId: ObjectId;
  userId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
} 