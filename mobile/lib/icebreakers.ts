export interface Icebreaker {
  id: string;
  textAz: string;
  textEn: string;
  category: "fun" | "deep" | "flirty";
}

export const ICEBREAKERS: Icebreaker[] = [
  {
    id: "ib1",
    textAz: "Həyatının filmində səni kim oynayardı? 🎬",
    textEn: "Who would play you in the movie of your life? 🎬",
    category: "fun"
  },
  {
    id: "ib2",
    textAz: "Uşaqlıqda ən çox sevdiyin cizgi filmi hansı idi? 📺",
    textEn: "What was your favorite cartoon growing up? 📺",
    category: "fun"
  },
  {
    id: "ib3",
    textAz: "Qeyri-adi bir bacarığın varmı? 🤹‍♂️",
    textEn: "Do you have any useless talents? 🤹‍♂️",
    category: "fun"
  },
  {
    id: "ib4",
    textAz: "Əgər indi dünyanın hər hansı bir yerinə gedə bilsəydin, hara gedərdin? ✈️",
    textEn: "If you could fly anywhere right now, where would you go? ✈️",
    category: "deep"
  },
  {
    id: "ib5",
    textAz: "Səncə ideal ilk görüş necə olmalıdır? 🍷",
    textEn: "What does your ideal first date look like? 🍷",
    category: "flirty"
  },
  {
    id: "ib6",
    textAz: "Ən çox nə bişirməyi (və ya yeməyi) sevirsən? 🍕",
    textEn: "What's your favorite meal to cook (or eat)? 🍕",
    category: "fun"
  },
  {
    id: "ib7",
    textAz: "Həyatında aldığın ən yaxşı məsləhət nə olub? 💡",
    textEn: "What's the best advice you've ever received? 💡",
    category: "deep"
  },
  {
    id: "ib8",
    textAz: "Pitsa üzərində ananas: Hə ya Yox? 🍍",
    textEn: "Pineapple on pizza: Yay or Nay? 🍍",
    category: "fun"
  }
];

export const GLOBAL_ICEBREAKERS: Icebreaker[] = [
  {
    id: "global1",
    textAz: "Hər kəsə salam! Gününüz necə keçir? 👋",
    textEn: "Hello everyone! How is your day going? 👋",
    category: "fun"
  },
  {
    id: "global2",
    textAz: "Bu qrupun ən sevimli uşaqlıq cizgi filmi hansıdır? 📺",
    textEn: "What is this group's favorite childhood cartoon? 📺",
    category: "fun"
  },
  {
    id: "global3",
    textAz: "Əgər cəmiyyət idarəçiliyi bizə verilsə, ilk qanununuz nə olardı? 📜",
    textEn: "If we were in charge of society, what would your first law be? 📜",
    category: "deep"
  },
  {
    id: "global4",
    textAz: "Kimin ən qəribə/maraqlı hobbisi var? 🤹‍♂️",
    textEn: "Who here has the weirdest/most interesting hobby? 🤹‍♂️",
    category: "fun"
  },
  {
    id: "global5",
    textAz: "Hazırda ən çox dinlədiyiniz mahnı hansıdır? 🎵",
    textEn: "What song are you listening to the most right now? 🎵",
    category: "fun"
  },
  {
    id: "global6",
    textAz: "Bu il hədəfinizə çatdığınız ən az bir uğuru bölüşün 🏆",
    textEn: "Share at least one goal you've achieved this year 🏆",
    category: "deep"
  }
];
