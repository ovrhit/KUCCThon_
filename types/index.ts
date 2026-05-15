export interface Target {
  id: string;
  slug?: string;
  name: string;
  description: string;
  color: string;
}

export interface GratitudeLog {
  id: string;
  targetId: string;
  message: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  createdAt: string;
  recordedDate: string;
}
