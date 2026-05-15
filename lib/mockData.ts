import { Target, GratitudeLog } from "@/types";

export const MOCK_TARGETS: Target[] = [
  { id: "me", name: "나 자신", description: "오늘의 나에게 하는 한마디", color: "bg-black" },
  { id: "parents", name: "부모님", description: "세상에서 가장 소중한 분들", color: "bg-orange-400" },
  { id: "friend-1", name: "민수", description: "함께 있으면 즐거운 친구", color: "bg-blue-500" },
  { id: "lover", name: "연인", description: "언제나 내 편인 사람", color: "bg-rose-400" },
];

export const MOCK_GRATITUDE_LOGS: GratitudeLog[] = [
  {
    id: "1",
    targetId: "parents",
    message: "오늘 맛있는 저녁 차려주셔서 감사해요.",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://picsum.photos/seed/1/400/225",
    createdAt: "2024-05-10T10:00:00Z",
    recordedDate: "2024-05-10",
  },
  {
    id: "2",
    targetId: "friend-1",
    message: "고민 들어줘서 정말 고마워!",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://picsum.photos/seed/2/400/225",
    createdAt: "2024-05-11T14:30:00Z",
    recordedDate: "2024-05-11",
  },
  {
    id: "3",
    targetId: "me",
    message: "오늘 하루도 수고 많았어. 푹 쉬자.",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://picsum.photos/seed/3/400/225",
    createdAt: "2024-05-12T22:00:00Z",
    recordedDate: "2024-05-12",
  },
] as GratitudeLog[];
