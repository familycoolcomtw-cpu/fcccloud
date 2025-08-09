export type FileType = 'image' | 'pdf' | 'video' | 'audio' | 'document' | 'archive' | 'folder' | 'other';

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  size?: number; // in bytes
  createdAt: string;
  tags: string[];
  children?: FileNode[]; // for folders
  aiHint?: string;
}
