export interface Item {
  id: number;
  type: 'video' | 'image' | 'project';
  title: string;
  description: string;
  file_path: string;
  preview_path?: string;
  collection_id?: number;
  created_at: string;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  preview_path: string;
  created_at: string;
}
