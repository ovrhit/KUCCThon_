import { GratitudeLog, Target } from "@/types";

export const DEFAULT_USER_ID = "00000000-0000-4000-8000-000000000001";

export const MOCK_TARGETS: Target[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "me",
    name: "나 자신",
    description: "오늘의 나에게 전하는 한마디",
    color: "bg-black",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "parents",
    name: "부모님",
    description: "세상에서 가장 소중한 분들",
    color: "bg-orange-400",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "friend-1",
    name: "민수",
    description: "함께 있으면 즐거운 친구",
    color: "bg-blue-500",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    slug: "lover",
    name: "연인",
    description: "언제나 고마운 사람",
    color: "bg-rose-400",
  },
];

export function resolveTargetId(value: string | null | undefined) {
  if (!value) return MOCK_TARGETS[0].id;
  return MOCK_TARGETS.find((target) => target.id === value || target.slug === value)?.id ?? value;
}

export const MOCK_GRATITUDE_LOGS: GratitudeLog[] = [
  {
    id: "1",
    targetId: "22222222-2222-4222-8222-222222222222",
    message: "오늘 맛있는 밥 차려주셔서 감사해요.",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://picsum.photos/seed/1/400/225",
    createdAt: "2024-05-10T10:00:00Z",
    recordedDate: "2024-05-10",
  },
  {
    id: "2",
    targetId: "33333333-3333-4333-8333-333333333333",
    message: "고민 들어줘서 정말 고마워.",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://picsum.photos/seed/2/400/225",
    createdAt: "2024-05-11T14:30:00Z",
    recordedDate: "2024-05-11",
  },
  {
    id: "3",
    targetId: "11111111-1111-4111-8111-111111111111",
    message: "오늘 하루도 잘 버텼어. 수고했어.",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://picsum.photos/seed/3/400/225",
    createdAt: "2024-05-12T22:00:00Z",
    recordedDate: "2024-05-12",
  },
];
