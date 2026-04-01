export interface BaseUser {
  id: string;
  email?: string;
}

export interface ImageRecord {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: Date;
  userId?: string;
}

export interface GenerateImageRequest {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
