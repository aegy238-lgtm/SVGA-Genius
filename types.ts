
export interface Feature {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export enum AppState {
  LOGIN = 'LOGIN',
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  EXPORTING = 'EXPORTING',
  ADMIN_PANEL = 'ADMIN_PANEL',
  IMAGE_COMPRESSION = 'IMAGE_COMPRESSION'
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  isApproved: boolean;
  status: 'active' | 'banned' | 'pending';
  createdAt: any;
  lastLogin: any;
  diamonds: number;
  manualVIP?: boolean; // خاصية التحكم اليدوي في الامتيازات
}

export interface SupportMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  text: string;
  reply?: string;
  status: 'new' | 'replied';
  timestamp: any;
}

export interface ProcessLog {
  id: string;
  fileName: string;
  userEmail: string;
  userName: string;
  timestamp: any;
  fileSize: number;
  dimensions: string;
  frames: number;
  fileUrl?: string;
}

export interface MaterialAsset {
  id: string;
  type: 'image' | 'audio';
  name: string;
  size: string;
  dimensions?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  dimensions?: { width: number; height: number };
  fps?: number;
  frames?: number;
  assets?: MaterialAsset[];
  videoItem?: any;
  fileUrl?: string;
}
