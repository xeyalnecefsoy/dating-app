// Stories Types and Mock Data

export type Story = {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  createdAt: Date;
  expiresAt: Date;
  viewedBy: string[];
  viewedByDetails?: { clerkId: string, name: string, avatar: string }[];
};

export type UserStories = {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
  hasUnviewed: boolean;
};

// Mock Stories Data (24 hours validity)
const now = new Date();
const yesterday = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago

export const MOCK_STORIES: Story[] = [
  // Rena's stories (3 stories)
  {
    id: "story-1",
    userId: "13",
    mediaUrl: "/gallery/rena_1.jpg",
    mediaType: "image",
    caption: "Gym time! 💪",
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 22 * 60 * 60 * 1000),
    viewedBy: [],
  },
  {
    id: "story-2",
    userId: "13",
    mediaUrl: "/gallery/rena_3.jpg",
    mediaType: "image",
    caption: "Date night vibes ✨",
    createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 23 * 60 * 60 * 1000),
    viewedBy: [],
  },
  // Tural's story
  {
    id: "story-3",
    userId: "2",
    mediaUrl: "/avatars/tural.png",
    mediaType: "image",
    caption: "Hiking in the mountains 🏔️",
    createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 20 * 60 * 60 * 1000),
    viewedBy: [],
  },
  // Selcan's stories (2 stories)
  {
    id: "story-4",
    userId: "1",
    mediaUrl: "/avatars/selcan.png",
    mediaType: "image",
    caption: "Coffee & books 📚☕",
    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 18 * 60 * 60 * 1000),
    viewedBy: [],
  },
  {
    id: "story-5",
    userId: "1",
    mediaUrl: "/gallery/selcan_1.png",
    mediaType: "image",
    caption: "Art exhibition 🎨",
    createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 19 * 60 * 60 * 1000),
    viewedBy: [],
  },
  // Aylin's story
  {
    id: "story-6",
    userId: "8",
    mediaUrl: "/avatars/aylin.png",
    mediaType: "image",
    caption: "Beach day 🏖️",
    createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 21 * 60 * 60 * 1000),
    viewedBy: [],
  },
  // Nigar's story
  {
    id: "story-7",
    userId: "9",
    mediaUrl: "/avatars/nigar.png",
    mediaType: "image",
    caption: "Yoga morning 🧘‍♀️",
    createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 16 * 60 * 60 * 1000),
    viewedBy: [],
  },
  // Fidan's story  
  {
    id: "story-8",
    userId: "10",
    mediaUrl: "/avatars/fidan.png",
    mediaType: "image",
    caption: "Cooking something special 🍳",
    createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 23 * 60 * 60 * 1000),
    viewedBy: [],
  },
];

// Helper to get stories grouped by user
export function getStoriesByUser(stories: Story[], mockUsers: any[]): UserStories[] {
  const userStoriesMap = new Map<string, Story[]>();
  
  // Group stories by userId
  stories.forEach(story => {
    if (!userStoriesMap.has(story.userId)) {
      userStoriesMap.set(story.userId, []);
    }
    userStoriesMap.get(story.userId)!.push(story);
  });

  // Convert to UserStories array
  const result: UserStories[] = [];
  userStoriesMap.forEach((userStories, oderId) => {
    const user = mockUsers.find(u => u.id === oderId);
    if (user) {
      // Sort stories by createdAt (oldest first)
      userStories.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      result.push({
        userId: oderId,
        userName: user.name,
        userAvatar: user.avatar,
        stories: userStories,
        hasUnviewed: userStories.some(s => !s.viewedBy.includes("current-user")),
      });
    }
  });

  // Sort by most recent story
  result.sort((a, b) => {
    const aLatest = new Date(a.stories[a.stories.length - 1].createdAt).getTime();
    const bLatest = new Date(b.stories[b.stories.length - 1].createdAt).getTime();
    return bLatest - aLatest;
  });

  return result;
}

// Check if user has active stories
export function userHasStories(userId: string, stories: Story[]): boolean {
  return stories.some(s => s.userId === userId && new Date() < new Date(s.expiresAt));
}

// Get time ago string
export function getTimeAgo(date: Date | number | string, language: "en" | "az"): string {
  const now = new Date();
  const dateMs = new Date(date).getTime();
  const diffMs = now.getTime() - dateMs;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) {
    return language === "az" ? "İndi" : "Just now";
  } else if (diffMins < 60) {
    return language === "az" ? `${diffMins} dəq` : `${diffMins}m`;
  } else {
    return language === "az" ? `${diffHours} saat` : `${diffHours}h`;
  }
}
