import { GratitudeLog } from "@/types";

export const MOCK_GRATITUDE_LOGS: GratitudeLog[] = [
  {
    id: "1",
    targetName: "부모님",
    message: "오늘 맛있는 저녁 차려주셔서 감사해요.",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    createdAt: "2024-05-10T10:00:00Z",
  },
  {
    id: "2",
    targetName: "친구",
    message: "고민 들어줘서 정말 고마워!",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    createdAt: "2024-05-11T14:30:00Z",
  },
  {
    id: "3",
    targetName: "나 자신",
    message: "오늘 하루도 수고 많았어. 푹 쉬자.",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    createdAt: "2024-05-12T22:00:00Z",
  },
];
