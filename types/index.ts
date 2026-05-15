export interface Target {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface GratitudeLog {
  id: string;
  targetId: string;
  message: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  recordedDate: string;
}
