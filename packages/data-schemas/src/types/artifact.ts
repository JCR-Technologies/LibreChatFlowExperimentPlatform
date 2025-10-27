import type { Document, Types } from 'mongoose';

export interface IArtifact extends Document {
  artifactId: string;
  title: string;
  description: string;
  instructions: string;
  artifactCode: string;
  conversationId: string;
  author: string;
  category: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  thumbnail?: string;
  likes: number;
  plays: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IArtifactSession extends Document {
  sessionId: string;
  artifactId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  completed: boolean;
  questionnaireResponses?: any;
  createdAt: Date;
  updatedAt: Date;
}