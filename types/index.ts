export type TargetType = '부모님' | '친구' | '연인' | '나 자신';

export interface GratitudeLog {
  id: string;
  targetName: TargetType;
  message: string;
  videoUrl: string;
  createdAt: string;
}
