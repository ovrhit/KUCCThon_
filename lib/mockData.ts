import { GratitudeLog, Target } from "@/types";

export const PUBLIC_DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

export const MOCK_TARGETS: Target[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "나 자신",
    description: "오늘의 나에게 하는 한마디",
    color: "bg-black",
    slug: "me",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "부모님",
    description: "세상에서 가장 소중한 분들",
    color: "bg-orange-400",
    slug: "parents",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "민수",
    description: "함께 있으면 즐거운 친구",
    color: "bg-blue-500",
    slug: "friend-1",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "연인",
    description: "언제나 내 편인 사람",
    color: "bg-rose-400",
    slug: "lover",
  },
];

export const MOCK_GRATITUDE_LOGS: GratitudeLog[] = [
  {
    id: "1",
    targetId: "00000000-0000-0000-0000-000000000002",
    message: "오늘 맛있는 저녁 차려주셔서 감사해요.",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://picsum.photos/seed/1/400/225",
    createdAt: "2024-05-10T10:00:00Z",
    recordedDate: "2024-05-10",
  },
  {
    id: "2",
    targetId: "00000000-0000-0000-0000-000000000003",
    message: "고민 들어줘서 정말 고마워.",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://picsum.photos/seed/2/400/225",
    createdAt: "2024-05-11T14:30:00Z",
    recordedDate: "2024-05-11",
  },
  {
    id: "3",
    targetId: "00000000-0000-0000-0000-000000000001",
    message: "오늘 하루도 수고 많았어. 푹 쉬자.",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://picsum.photos/seed/3/400/225",
    createdAt: "2024-05-12T22:00:00Z",
    recordedDate: "2024-05-12",
  },
];

export function resolveTargetId(idOrSlug: string): string {
  const target = MOCK_TARGETS.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
  return target ? target.id : idOrSlug;
}
