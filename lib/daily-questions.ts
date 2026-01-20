export type DailyQuestion = {
  id: string;
  question: {
    en: string;
    az: string;
  };
  category: "values" | "relationships" | "growth" | "fun";
};

export const dailyQuestions: DailyQuestion[] = [
  {
    id: "1",
    question: {
      en: "What does a perfect Sunday look like for you?",
      az: "Sizin üçün mükəmməl Bazar günü necə görünür?"
    },
    category: "fun"
  },
  {
    id: "2",
    question: {
      en: "What's one value you would never compromise on in a relationship?",
      az: "Münasibətdə heç vaxt güzəştə getməyəcəyiniz bir dəyər nədir?"
    },
    category: "values"
  },
  {
    id: "3",
    question: {
      en: "How do you show someone you care about them?",
      az: "Birinin sizin üçün əhəmiyyətli olduğunu necə göstərirsiniz?"
    },
    category: "relationships"
  },
  {
    id: "4",
    question: {
      en: "What's a skill you're currently trying to improve?",
      az: "Hazırda hansı bacarığınızı təkmilləşdirməyə çalışırsınız?"
    },
    category: "growth"
  },
  {
    id: "5",
    question: {
      en: "If you could have dinner with anyone, who would it be and why?",
      az: "Hər kəslə nahar edə bilsəniz, kim olardı və niyə?"
    },
    category: "fun"
  },
  {
    id: "6",
    question: {
      en: "What does 'home' mean to you?",
      az: "'Ev' sizin üçün nə deməkdir?"
    },
    category: "values"
  },
  {
    id: "7",
    question: {
      en: "How do you handle disagreements with people you love?",
      az: "Sevdiyiniz insanlarla fikir ayrılıqlarını necə həll edirsiniz?"
    },
    category: "relationships"
  },
  {
    id: "8",
    question: {
      en: "What's something you learned about yourself recently?",
      az: "Bu yaxınlarda özünüz haqqında nə öyrəndiniz?"
    },
    category: "growth"
  },
  {
    id: "9",
    question: {
      en: "What small thing brings you unexpected joy?",
      az: "Sizə gözlənilməz sevinc gətirən kiçik şey nədir?"
    },
    category: "fun"
  },
  {
    id: "10",
    question: {
      en: "What does trust look like in your ideal relationship?",
      az: "İdeal münasibətinizdə etibar necə görünür?"
    },
    category: "relationships"
  },
  {
    id: "11",
    question: {
      en: "What are you most grateful for today?",
      az: "Bu gün ən çox nəyə görə minnətdarsınız?"
    },
    category: "values"
  },
  {
    id: "12",
    question: {
      en: "Describe your perfect first date.",
      az: "Mükəmməl ilk görüşünüzü təsvir edin."
    },
    category: "relationships"
  },
  {
    id: "13",
    question: {
      en: "What book or movie changed your perspective on life?",
      az: "Hansı kitab və ya film həyata baxışınızı dəyişdirdi?"
    },
    category: "growth"
  },
  {
    id: "14",
    question: {
      en: "What tradition from your family would you want to continue?",
      az: "Ailənizin hansı ənənəsini davam etdirmək istərdiniz?"
    },
    category: "values"
  },
];

export function getTodaysQuestion(): DailyQuestion {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % dailyQuestions.length;
  return dailyQuestions[index];
}
