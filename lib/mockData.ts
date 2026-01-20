// ============================================================================
// MOCK DATA FOR ANTIGRAVITY DATING PLATFORM
// Culturally authentic data for the Azerbaijani context
// ============================================================================

// ----------------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------------

export type PersonalityType = 
  | "INFP" | "INFJ" | "INTP" | "INTJ" 
  | "ISFP" | "ISFJ" | "ISTP" | "ISTJ"
  | "ENFP" | "ENFJ" | "ENTP" | "ENTJ"
  | "ESFP" | "ESFJ" | "ESTP" | "ESTJ";

export type CoachScenario = {
  id: string;
  title: string;
  description: string;
  initialMessage: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "first-meeting" | "deepening" | "conflict" | "cultural";
  tips: string[];
};

export type DeepUserProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  occupation: string;
  personalityType: PersonalityType;
  bio: string;
  
  // Deep Profile Fields
  values: string[];
  loveLanguage: string;
  communicationStyle: "Direct" | "Empathetic" | "Analytical" | "Playful";
  attachmentStyle: "Secure" | "Anxious" | "Avoidant" | "Fearful-Avoidant";
  
  // Conversation & Interests
  favoriteTopics: string[];
  hobbies: string[];
  dealBreakers: string[];
  
  // Ice-breakers specific to this person
  iceBreakers: string[];
  
  // Cultural nuances
  familyOrientation: "Traditional" | "Modern" | "Balanced";
  languagesSpoken: string[];
  
  avatar: string;
};

export type QuickTip = {
  id: string;
  title: string;
  content: string;
  category: "conversation" | "body-language" | "cultural" | "emotional" | "first-date";
  icon: string; // emoji for visual appeal
};

// ----------------------------------------------------------------------------
// COACH SCENARIOS
// Practice scenarios for the communication simulator
// ----------------------------------------------------------------------------

export const COACH_SCENARIOS: CoachScenario[] = [
  {
    id: "baku-boulevard-intro",
    title: "Meeting on Baku Boulevard",
    description: "You notice someone interesting reading a book on a bench along the seaside promenade. Practice starting a natural conversation.",
    initialMessage: "Excuse me, I couldn't help but notice you're reading Dostoyevsky. Is that 'Crime and Punishment'?",
    difficulty: "beginner",
    category: "first-meeting",
    tips: [
      "Reference something specific you noticed about them",
      "Keep your tone light and non-intrusive",
      "Be prepared to gracefully exit if they seem busy"
    ]
  },
  {
    id: "chai-khana-connection",
    title: "Çay Xanası Conversation",
    description: "You're at a traditional tea house and end up sharing a table during a busy evening. Navigate this classic Azerbaijani social setting.",
    initialMessage: "Salam! Looks like they've seated us together. I'm Kamran. Have you tried their çay with quince jam? It's my favorite.",
    difficulty: "beginner",
    category: "cultural",
    tips: [
      "Embrace the shared-table culture warmly",
      "Food and tea make excellent conversation bridges",
      "Ask about their favorite local spots"
    ]
  },
  {
    id: "family-question-first-date",
    title: "The Family Question",
    description: "On a first date, they ask about your family expectations and marriage timeline. Handle this common but sensitive topic gracefully.",
    initialMessage: "So, your family must be asking about when you're settling down, right? Mine won't stop! What's your situation?",
    difficulty: "intermediate",
    category: "cultural",
    tips: [
      "Be honest but don't overshare immediately",
      "It's okay to set gentle boundaries",
      "Acknowledge the cultural context with humor if appropriate"
    ]
  },
  {
    id: "disagreement-politics",
    title: "Navigating Different Views",
    description: "Your date expresses a strong opinion on a topic you disagree with. Practice respectful disagreement without conflict.",
    initialMessage: "Honestly, I think people who move abroad for work are abandoning their country. We should build things here.",
    difficulty: "advanced",
    category: "conflict",
    tips: [
      "Acknowledge their perspective before sharing yours",
      "Use 'I' statements instead of 'You're wrong'",
      "Find common ground where possible"
    ]
  },
  {
    id: "kharibulbul-festival",
    title: "Festival Connection",
    description: "You meet someone at the Kharibulbul music festival in Shusha. Bond over shared cultural appreciation.",
    initialMessage: "Wow, that mugham performance was incredible! Is this your first time at Kharibulbul?",
    difficulty: "beginner",
    category: "first-meeting",
    tips: [
      "Shared experiences create natural connection",
      "Ask about their music preferences",
      "Reference the historical significance of the location"
    ]
  },
  {
    id: "meet-the-friends",
    title: "Meeting Their Friend Group",
    description: "You're introduced to your date's close friends for the first time at a gathering. Make a good impression.",
    initialMessage: "So you're the one we've been hearing about! Don't worry, only good things. Tell us about yourself!",
    difficulty: "intermediate",
    category: "deepening",
    tips: [
      "Be authentic—friends can spot pretense",
      "Show genuine interest in each person",
      "Light self-deprecating humor works well"
    ]
  },
  {
    id: "vulnerability-moment",
    title: "Opening Up",
    description: "The conversation gets deeper. Your date shares something personal and asks you to do the same.",
    initialMessage: "I actually struggle with anxiety sometimes. It took me years to admit that. Have you ever dealt with something like that?",
    difficulty: "advanced",
    category: "deepening",
    tips: [
      "Thank them for trusting you",
      "Match their vulnerability level appropriately",
      "Don't redirect to advice—just listen and share"
    ]
  },
  {
    id: "planning-second-date",
    title: "Proposing the Next Meeting",
    description: "The first date went well. Practice confidently suggesting a second date with a specific plan.",
    initialMessage: "I had a really great time today. I'm glad we did this!",
    difficulty: "beginner",
    category: "deepening",
    tips: [
      "Be specific with your suggestion (day, activity)",
      "Read their signals before proposing",
      "A unique activity shows thoughtfulness"
    ]
  },
  {
    id: "defining-relationship",
    title: "The 'What Are We?' Talk",
    description: "After several dates, it's time to discuss where this is going. Navigate the exclusivity conversation.",
    initialMessage: "So... I've really enjoyed spending time with you. I was wondering where you see this going?",
    difficulty: "advanced",
    category: "deepening",
    tips: [
      "Be clear about what you want",
      "Listen to understand, not just to respond",
      "It's okay if you need time to think"
    ]
  },
  {
    id: "recovering-from-awkward",
    title: "Recovering from Awkwardness",
    description: "Something awkward happened (spilled tea, forgot their name, etc.). Learn to recover with grace and humor.",
    initialMessage: "So... did you just call the waiter by my name? *laughs* This is going well!",
    difficulty: "intermediate",
    category: "conflict",
    tips: [
      "Laugh at yourself—it's endearing",
      "Acknowledge the awkwardness directly",
      "Move forward without dwelling on it"
    ]
  }
];

// ----------------------------------------------------------------------------
// DEEP USER PROFILES
// Rich, culturally authentic profiles for the Azerbaijani context
// ----------------------------------------------------------------------------

export const DEEP_USER_PROFILES: DeepUserProfile[] = [
  {
    id: "profile-1",
    name: "Günay",
    age: 27,
    location: "Baku",
    occupation: "UX Designer at a fintech startup",
    personalityType: "ENFP",
    bio: "I design apps by day and overthink life by night. Looking for someone who appreciates deep talks over çay and spontaneous weekend trips to Qabala.",
    
    values: ["Creativity", "Authenticity", "Growth", "Adventure"],
    loveLanguage: "Quality Time",
    communicationStyle: "Playful",
    attachmentStyle: "Secure",
    
    favoriteTopics: [
      "Psychology and human behavior",
      "Future of Baku's tech scene",
      "Travel stories and hidden gems in Azerbaijan",
      "Philosophy of happiness"
    ],
    hobbies: ["Hiking in the Caucasus", "Pottery classes", "Indie films", "Learning guitar"],
    dealBreakers: ["Dishonesty", "Lack of ambition", "Closed-mindedness"],
    
    iceBreakers: [
      "If Baku was a person, what would their personality be like?",
      "What's the most spontaneous thing you've ever done?",
      "If you could have dinner with any Azerbaijani historical figure, who would it be?"
    ],
    
    familyOrientation: "Balanced",
    languagesSpoken: ["Azerbaijani", "English", "Russian"],
    avatar: "https://i.pravatar.cc/150?u=gunay"
  },
  {
    id: "profile-2",
    name: "Tural",
    age: 30,
    location: "Ganja",
    occupation: "Surgeon at Ganja City Hospital",
    personalityType: "ISTJ",
    bio: "Dedicated to my work, but I believe life needs balance. I find peace in morning runs, cooking elaborate plov for friends, and finding new hiking trails in the mountains.",
    
    values: ["Dedication", "Reliability", "Family", "Health"],
    loveLanguage: "Acts of Service",
    communicationStyle: "Direct",
    attachmentStyle: "Secure",
    
    favoriteTopics: [
      "Medical innovations and healthcare in Azerbaijan",
      "Traditional Azerbaijani cuisine and recipes",
      "Fitness and wellness routines",
      "History of the South Caucasus"
    ],
    hobbies: ["Running marathons", "Cooking traditional dishes", "Chess", "Reading medical journals"],
    dealBreakers: ["Smoking", "Unreliability", "Disrespect to elders"],
    
    iceBreakers: [
      "What's the best plov you've ever had, and where was it?",
      "Do you think modern medicine is losing touch with traditional healing?",
      "If you had one day in Ganja, what would you do?"
    ],
    
    familyOrientation: "Traditional",
    languagesSpoken: ["Azerbaijani", "Russian", "Turkish"],
    avatar: "https://i.pravatar.cc/150?u=tural"
  },
  {
    id: "profile-3",
    name: "Nigar",
    age: 25,
    location: "Baku",
    occupation: "Documentary Filmmaker",
    personalityType: "INFJ",
    bio: "I tell stories that matter. Currently working on a documentary about Azerbaijani carpet weavers. I believe every person has a story worth telling—what's yours?",
    
    values: ["Empathy", "Art", "Social Justice", "Depth"],
    loveLanguage: "Words of Affirmation",
    communicationStyle: "Empathetic",
    attachmentStyle: "Anxious",
    
    favoriteTopics: [
      "Film and visual storytelling",
      "Preserving Azerbaijani cultural heritage",
      "Social issues and activism",
      "Art exhibitions in Baku"
    ],
    hobbies: ["Photography walks in Icherisheher", "Attending film festivals", "Journaling", "Visiting carpet museums"],
    dealBreakers: ["Apathy towards social issues", "Superficiality", "Impatience"],
    
    iceBreakers: [
      "If your life was a documentary, what would be the title?",
      "What's a piece of Azerbaijani culture you wish more people knew about?",
      "What story do you think the world needs to hear right now?"
    ],
    
    familyOrientation: "Modern",
    languagesSpoken: ["Azerbaijani", "English", "French"],
    avatar: "https://i.pravatar.cc/150?u=nigar"
  },
  {
    id: "profile-4",
    name: "Rashad",
    age: 28,
    location: "Sumgait",
    occupation: "Industrial Engineer",
    personalityType: "ENTP",
    bio: "Problem solver by nature, debater by choice. I'll challenge your ideas not to win, but because I genuinely want to understand how you think. Also, I make excellent dolma.",
    
    values: ["Logic", "Innovation", "Curiosity", "Freedom"],
    loveLanguage: "Physical Touch",
    communicationStyle: "Analytical",
    attachmentStyle: "Avoidant",
    
    favoriteTopics: [
      "Technology and industrial innovation",
      "Philosophy and thought experiments",
      "Economics and entrepreneurship",
      "Debate and rhetoric"
    ],
    hobbies: ["Building things in his garage", "Debate clubs", "Playing backgammon (nard)", "Watching tech documentaries"],
    dealBreakers: ["Intellectual dishonesty", "Clinginess", "Lack of curiosity"],
    
    iceBreakers: [
      "What's an unpopular opinion you hold that you're proud of?",
      "If you could redesign one thing about daily life in Azerbaijan, what would it be?",
      "What's the best argument you've ever lost?"
    ],
    
    familyOrientation: "Balanced",
    languagesSpoken: ["Azerbaijani", "English", "German"],
    avatar: "https://i.pravatar.cc/150?u=rashad"
  },
  {
    id: "profile-5",
    name: "Sevinc",
    age: 26,
    location: "Sheki",
    occupation: "Boutique Hotel Manager",
    personalityType: "ESFJ",
    bio: "Born in the city of hospitality, it's in my blood. I love connecting with people, creating warm experiences, and preserving the magic of Sheki. Looking for a partner to share this beautiful life with.",
    
    values: ["Hospitality", "Community", "Tradition", "Warmth"],
    loveLanguage: "Receiving Gifts",
    communicationStyle: "Empathetic",
    attachmentStyle: "Secure",
    
    favoriteTopics: [
      "Hospitality and tourism in Azerbaijan",
      "Sheki's history and architecture",
      "Event planning and celebrations",
      "Family traditions and recipes"
    ],
    hobbies: ["Organizing cultural events", "Baking pakhlava", "Interior decorating", "Gardening"],
    dealBreakers: ["Rudeness to service workers", "Disrespect to traditions", "Selfishness"],
    
    iceBreakers: [
      "Have you visited the Sheki Khan's Palace? What did you think?",
      "What's a family tradition you hope to continue someday?",
      "If you could host any event, what would it be?"
    ],
    
    familyOrientation: "Traditional",
    languagesSpoken: ["Azerbaijani", "Russian", "English"],
    avatar: "https://i.pravatar.cc/150?u=sevinc"
  },
  {
    id: "profile-6",
    name: "Elmar",
    age: 32,
    location: "Baku",
    occupation: "Jazz Musician & Music Teacher",
    personalityType: "ISFP",
    bio: "Music is my first language, Azerbaijani is my second. I teach piano by day and play saxophone in a jazz quartet by night. Looking for someone who appreciates the quiet moments as much as the crescendos.",
    
    values: ["Art", "Patience", "Sensitivity", "Passion"],
    loveLanguage: "Quality Time",
    communicationStyle: "Empathetic",
    attachmentStyle: "Fearful-Avoidant",
    
    favoriteTopics: [
      "Jazz and its connection to mugham",
      "Music education in Azerbaijan",
      "The philosophy of art",
      "Vinyl records and audio equipment"
    ],
    hobbies: ["Attending Jazz Center concerts", "Collecting vinyl records", "Long walks along the Caspian", "Sketching"],
    dealBreakers: ["Unable to enjoy silence", "Materialism", "Dismissing arts as 'not a real job'"],
    
    iceBreakers: [
      "What song would you choose as the soundtrack to your life right now?",
      "Do you think music can cross cultural boundaries better than language?",
      "What's the last live performance that moved you?"
    ],
    
    familyOrientation: "Modern",
    languagesSpoken: ["Azerbaijani", "English", "Russian"],
    avatar: "https://i.pravatar.cc/150?u=elmar"
  },
  {
    id: "profile-7",
    name: "Lamiya",
    age: 29,
    location: "Baku",
    occupation: "Environmental Lawyer",
    personalityType: "INTJ",
    bio: "Fighting for the Caspian, one case at a time. I believe in systemic change over performative activism. Looking for a partner who's building something meaningful with their life.",
    
    values: ["Justice", "Strategy", "Sustainability", "Independence"],
    loveLanguage: "Acts of Service",
    communicationStyle: "Direct",
    attachmentStyle: "Avoidant",
    
    favoriteTopics: [
      "Environmental policy in the Caspian region",
      "Legal systems and reform",
      "Geopolitics of the South Caucasus",
      "Effective altruism and impact"
    ],
    hobbies: ["Reading policy papers", "Kayaking on the Caspian", "Strategic board games", "Learning new languages"],
    dealBreakers: ["Complacency", "Political ignorance", "Emotional manipulation"],
    
    iceBreakers: [
      "What's one change you'd make to Azerbaijan if you had the power?",
      "Do you think individuals can really make a difference, or is it all systems?",
      "What's the most important decision you've made this year?"
    ],
    
    familyOrientation: "Modern",
    languagesSpoken: ["Azerbaijani", "English", "Russian", "German"],
    avatar: "https://i.pravatar.cc/150?u=lamiya"
  },
  {
    id: "profile-8",
    name: "Farid",
    age: 31,
    location: "Lankaran",
    occupation: "Agricultural Entrepreneur (Citrus Farms)",
    personalityType: "ESTP",
    bio: "Third-generation citrus farmer, first-generation to sell online! I love the land, the sea, and a good adventure. Looking for someone who appreciates getting their hands dirty sometimes.",
    
    values: ["Hard Work", "Family Legacy", "Adventure", "Simplicity"],
    loveLanguage: "Physical Touch",
    communicationStyle: "Playful",
    attachmentStyle: "Secure",
    
    favoriteTopics: [
      "Sustainable agriculture and innovation",
      "The beauty of Southern Azerbaijan",
      "Business and entrepreneurship",
      "Fishing and the Caspian Sea"
    ],
    hobbies: ["Fishing trips", "Off-roading in the Talysh mountains", "BBQs with family", "Teaching young farmers"],
    dealBreakers: ["City snobbery", "Laziness", "Disconnection from nature"],
    
    iceBreakers: [
      "Ever tried fresh-picked citrus right from the tree? It's life-changing!",
      "What's your relationship with nature? City life or countryside soul?",
      "If you could start a business, what would it be?"
    ],
    
    familyOrientation: "Traditional",
    languagesSpoken: ["Azerbaijani", "Russian", "Talysh"],
    avatar: "https://i.pravatar.cc/150?u=farid-lankaran"
  }
];

// ----------------------------------------------------------------------------
// QUICK TIPS FOR ROMANTIC COMMUNICATION
// Practical, culturally-aware advice
// ----------------------------------------------------------------------------

export const QUICK_TIPS: QuickTip[] = [
  {
    id: "tip-1",
    title: "The Power of Çay",
    content: "In Azerbaijani culture, sharing tea is an invitation to connection. If someone offers you çay, they're offering time and attention. Slow down and be present—don't rush through it.",
    category: "cultural",
    icon: "🍵"
  },
  {
    id: "tip-2",
    title: "Ask About Family—Thoughtfully",
    content: "Family is central to Azerbaijani identity. Asking 'Tell me about your family' shows interest, but avoid prying into marriage pressure or expectations too early. Let it come naturally.",
    category: "cultural",
    icon: "👨‍👩‍👧‍👦"
  },
  {
    id: "tip-3",
    title: "The 3:1 Ratio",
    content: "For every statement you make about yourself, ask at least one thoughtful question about them. This creates balance and shows genuine interest, not just a desire to impress.",
    category: "conversation",
    icon: "⚖️"
  },
  {
    id: "tip-4",
    title: "Mirror Body Language",
    content: "Subtly matching your date's posture, gestures, and speaking pace builds subconscious rapport. If they lean in, lean in. If they speak slowly, slow down. Don't overdo it—keep it natural.",
    category: "body-language",
    icon: "🪞"
  },
  {
    id: "tip-5",
    title: "Validate Before Advising",
    content: "When your partner shares a problem, resist the urge to immediately solve it. First say: 'That sounds really difficult' or 'I can see why you feel that way.' People want to feel heard before they want solutions.",
    category: "emotional",
    icon: "💭"
  },
  {
    id: "tip-6",
    title: "The Compliment Formula",
    content: "Combine specificity with character: instead of 'You're smart,' try 'The way you explained that shows how deeply you think about things.' This feels more genuine and memorable.",
    category: "conversation",
    icon: "✨"
  },
  {
    id: "tip-7",
    title: "Navigate the Check Gracefully",
    content: "In Azerbaijani dating culture, there's often an expectation around who pays. Be prepared to offer, but also be gracious if they insist. A good phrase: 'I'd love to get this one—you can treat me next time.'",
    category: "first-date",
    icon: "💳"
  },
  {
    id: "tip-8",
    title: "Silence is Not Failure",
    content: "Comfortable silence is a sign of connection, not awkwardness. Don't rush to fill every pause. Sometimes the best moments are when you're both just... present.",
    category: "conversation",
    icon: "🤫"
  },
  {
    id: "tip-9",
    title: "Eye Contact Balance",
    content: "Maintain eye contact about 60-70% of the time during conversation. Too little seems disinterested; too much feels intense. Look away naturally when thinking, then reconnect.",
    category: "body-language",
    icon: "👁️"
  },
  {
    id: "tip-10",
    title: "The Follow-Up Text",
    content: "After a good date, text within 24 hours. Reference something specific: 'I'm still thinking about that story you told about Sheki!' This shows you were truly listening.",
    category: "first-date",
    icon: "📱"
  },
  {
    id: "tip-11",
    title: "Respect the Unspoken",
    content: "In Azerbaijani culture, some things are communicated indirectly. If someone says 'maybe later' or seems hesitant, respect the soft 'no.' Pushing past it breaks trust.",
    category: "cultural",
    icon: "🤐"
  },
  {
    id: "tip-12",
    title: "Emotional Bids",
    content: "When your partner shares something—even small things like 'Look at that sunset!'—they're making a 'bid' for connection. Turn toward it: 'Wow, it's beautiful!' Ignoring these bids erodes intimacy over time.",
    category: "emotional",
    icon: "🌅"
  },
  {
    id: "tip-13",
    title: "Choose Venues Wisely",
    content: "For first dates in Azerbaijan, consider venues that allow conversation: a quiet café in Icheri Sheher, a walk on the Boulevard, or a museum. Avoid noisy clubs where you can't talk.",
    category: "first-date",
    icon: "📍"
  },
  {
    id: "tip-14",
    title: "Name Repetition",
    content: "Using someone's name naturally in conversation creates warmth and intimacy. 'I really liked that point, Gunay' feels more personal than just 'I really liked that point.'",
    category: "conversation",
    icon: "🏷️"
  },
  {
    id: "tip-15",
    title: "Open vs. Closed Posture",
    content: "Crossed arms and angled-away body signal defensiveness. Keep your posture open: arms relaxed, body facing them, and lean in slightly. This signals interest and availability.",
    category: "body-language",
    icon: "🧍"
  },
  {
    id: "tip-16",
    title: "Share Vulnerability Gradually",
    content: "Deep connection requires vulnerability, but timing matters. Share progressively deeper things as trust builds. Don't trauma-dump on a first date, but don't stay surface-level forever either.",
    category: "emotional",
    icon: "🧅"
  },
  {
    id: "tip-17",
    title: "The 'And' Technique",
    content: "Instead of 'but' which negates what came before, use 'and': 'I hear your perspective, AND I see it differently' keeps the conversation collaborative, not combative.",
    category: "conversation",
    icon: "🔗"
  },
  {
    id: "tip-18",
    title: "Respect Regional Differences",
    content: "Cultural norms vary across Azerbaijan—Baku is more cosmopolitan, while cities like Sheki or Lankaran may have more traditional expectations. Be aware and respectful of these differences.",
    category: "cultural",
    icon: "🗺️"
  },
  {
    id: "tip-19",
    title: "The Repair Attempt",
    content: "In any conflict, one person needs to extend an olive branch—a joke, a touch, an apology. Gottman calls this a 'repair attempt.' Accept these graciously, even if you're upset.",
    category: "emotional",
    icon: "🕊️"
  },
  {
    id: "tip-20",
    title: "End on a High",
    content: "Leave dates while they're still enjoyable. The 'peak-end rule' means people remember experiences by their best moment and how they ended. A great ending > a long, dragging goodbye.",
    category: "first-date",
    icon: "🎬"
  }
];

// ----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// ----------------------------------------------------------------------------

export const getScenariosByDifficulty = (difficulty: CoachScenario["difficulty"]) => 
  COACH_SCENARIOS.filter(s => s.difficulty === difficulty);

export const getScenariosByCategory = (category: CoachScenario["category"]) =>
  COACH_SCENARIOS.filter(s => s.category === category);

export const getTipsByCategory = (category: QuickTip["category"]) =>
  QUICK_TIPS.filter(t => t.category === category);

export const getUsersByPersonalityType = (type: PersonalityType) =>
  DEEP_USER_PROFILES.filter(u => u.personalityType === type);

export const getUsersByLocation = (location: string) =>
  DEEP_USER_PROFILES.filter(u => u.location.toLowerCase() === location.toLowerCase());

export const getRandomIceBreaker = (userId: string): string | undefined => {
  const user = DEEP_USER_PROFILES.find(u => u.id === userId);
  if (!user || user.iceBreakers.length === 0) return undefined;
  return user.iceBreakers[Math.floor(Math.random() * user.iceBreakers.length)];
};

export const getRandomTip = (): QuickTip => {
  return QUICK_TIPS[Math.floor(Math.random() * QUICK_TIPS.length)];
};

// Export all data for easy access
export const mockData = {
  scenarios: COACH_SCENARIOS,
  users: DEEP_USER_PROFILES,
  tips: QUICK_TIPS
};

export default mockData;
