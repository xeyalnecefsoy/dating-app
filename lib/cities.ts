export interface CityData {
  slug: string;
  name: string;
  nameLocative: string; // "Bakıda", "Gəncədə" etc.
  population: string;
  description: string;
  longDescription: string;
  features: string[];
  metaTitle: string;
  metaDescription: string;
}

export const cities: CityData[] = [
  {
    slug: "bakida",
    name: "Bakı",
    nameLocative: "Bakıda",
    population: "2.3 milyon",
    description: "Azərbaycanın paytaxtı və ən böyük şəhəri olan Bakıda minlərlə tək insan ciddi münasibət axtarır. Danyeri ilə Bakının hər yerindən - Nəsimi, Yasamal, Nərimanov, Binəqədi, Xətai və digər rayonlardan həyat yoldaşınızı tapın.",
    longDescription: "Bakı, Azərbaycanın ən dinamik və kosmopolit şəhəridir. 2 milyondan çox əhalisi ilə burada tanışlıq imkanları genişdir, lakin müasir həyat tempi insanların bir-birini tanımasını çətinləşdirir. Danyeri, Bakıda yaşayan gəncləri bir araya gətirərək, mənalı və uzunmüddətli münasibətlər qurmağa kömək edir. İstər İçərişəhərdə gəzintiyə çıxın, istər Bulvarda tanışın - Danyeri sizin üçün ən uyğun insanı tapır.",
    features: [
      "Bakıda 5000+ aktiv istifadəçi",
      "Rayon bazlı filtrasiya imkanı",
      "Bakıda görüşmək üçün ən yaxşı məkanlar tövsiyəsi",
      "Təhlükəsiz və yoxlanılmış profillər"
    ],
    metaTitle: "Bakıda Tanışlıq - Ciddi Münasibət və Evlilik | Danyeri",
    metaDescription: "Bakıda ciddi tanışlıq və evlilik üçün ən etibarlı tətbiq. Nəsimi, Yasamal, Nərimanov və digər rayonlardan həyat yoldaşınızı tapın. Pulsuz qeydiyyat!"
  },
  {
    slug: "gencede",
    name: "Gəncə",
    nameLocative: "Gəncədə",
    population: "340 min",
    description: "Azərbaycanın ikinci böyük şəhəri Gəncədə ciddi münasibət axtaran insanlarla tanış olun. Danyeri, Gəncədə etibarlı tanışlıq platforması olaraq, həyat yoldaşınızı tapmaqda sizə kömək edir.",
    longDescription: "Gəncə, zəngin tarixi və mədəniyyəti ilə Azərbaycanın ikinci paytaxtı hesab olunur. Nizami Gəncəvinin vətəni olan bu şəhərdə yaşayan gənclər üçün Danyeri, ciddi münasibət və evlilik platforması təqdim edir. Gəncədə tanışlıq axtarışınızda Danyeri sizin etibarlı tərəfdaşınızdır. Gəncə Dövlət Universitetinin tələbələrindən tutmuş, şəhərdə çalışan peşəkarlara qədər hər kəs burada uyğun insanı tapa bilər.",
    features: [
      "Gəncədə artan istifadəçi bazası",
      "Gəncə və ətraf rayonlardan profillər",
      "Ortaq maraqlar əsasında uyğunlaşdırma",
      "Təhlükəsiz mesajlaşma sistemi"
    ],
    metaTitle: "Gəncədə Tanışlıq - Ciddi Münasibət və Evlilik | Danyeri",
    metaDescription: "Gəncədə ciddi tanışlıq və evlilik üçün Danyeri-yə qoşulun. Azərbaycanın ikinci böyük şəhərində həyat yoldaşınızı tapın. Etibarlı və pulsuz!"
  },
  {
    slug: "sumqayitda",
    name: "Sumqayıt",
    nameLocative: "Sumqayıtda",
    population: "350 min",
    description: "Sumqayıtda tanışlıq və ciddi münasibət axtarırsınız? Danyeri ilə Sumqayıtda yaşayan minlərlə insanla tanış olun və həyat yoldaşınızı tapın.",
    longDescription: "Sumqayıt, Bakıdan sonra Azərbaycanın ən böyük sənaye şəhəridir. Gənc əhalisi ilə seçilən bu şəhərdə tanışlıq imkanları çoxdur. Danyeri, Sumqayıtda yaşayan insanları bir araya gətirərək, onların ciddi münasibət qurmalarına kömək edir. Sumqayıtın müasir infrastrukturu və Bakıya yaxınlığı burada yaşayan gənclərin sosial həyatını zənginləşdirir, Danyeri isə bu imkanları daha da genişləndirir.",
    features: [
      "Sumqayıtda aktiv istifadəçilər",
      "Sumqayıt-Bakı arası profil axtarışı",
      "Gənc və dinamik istifadəçi bazası",
      "Maraq dairəsinə görə uyğunlaşdırma"
    ],
    metaTitle: "Sumqayıtda Tanışlıq - Ciddi Münasibət və Evlilik | Danyeri",
    metaDescription: "Sumqayıtda ciddi tanışlıq və evlilik üçün Danyeri tətbiqinə qoşulun. Sumqayıtda həyat yoldaşınızı tapın. Pulsuz qeydiyyat!"
  },
  {
    slug: "xankendide",
    name: "Xankəndi",
    nameLocative: "Xankəndidə",
    population: "60 min",
    description: "Xankəndidə tanışlıq və yeni münasibətlər qurmaq istəyirsiniz? Danyeri ilə Qarabağda yaşayan insanlarla tanış olun və mənalı əlaqələr qurun.",
    longDescription: "Xankəndi, tarixi Qarabağ bölgəsinin mərkəzidir. Bu bölgədə yeni həyat quran insanlar üçün Danyeri, etibarlı tanışlıq platforması təqdim edir. Qarabağın bərpası ilə birlikdə, burada yeni ailələrin qurulması xüsusi əhəmiyyət daşıyır. Danyeri, Xankəndidə və ətraf ərazilərdə yaşayan insanları bir araya gətirərək, güclü ailələrin qurulmasına töhfə verir.",
    features: [
      "Qarabağ bölgəsindən profillər",
      "Bölgə bazlı axtarış imkanı",
      "Ciddi niyyətli istifadəçilər",
      "Yoxlanılmış və etibarlı profillər"
    ],
    metaTitle: "Xankəndidə Tanışlıq - Ciddi Münasibət və Evlilik | Danyeri",
    metaDescription: "Xankəndidə və Qarabağda ciddi tanışlıq üçün Danyeri-yə qoşulun. Qarabağda yeni həyat qurmaq istəyən insanlarla tanış olun."
  },
  {
    slug: "mingecevir",
    name: "Mingəçevir",
    nameLocative: "Mingəçevirdə",
    population: "110 min",
    description: "Mingəçevirdə tanışlıq və ciddi münasibət axtarırsınız? Danyeri ilə Mingəçevirdə yaşayan insanlarla tanış olun və gələcəyinizi birlikdə qurun.",
    longDescription: "Mingəçevir, Kür çayı üzərində qurulan gözəl şəhərdir. 'İşıqlar şəhəri' olaraq tanınan Mingəçevirdə yaşayan gənclər üçün Danyeri, ciddi tanışlıq platforması təqdim edir. Şəhərin sakit və gözəl mühiti, mənalı münasibətlər qurmaq üçün ideal şərait yaradır. Danyeri, Mingəçevirdə və ətraf rayonlarda yaşayan insanları bir araya gətirir.",
    features: [
      "Mingəçevir və ətraf rayonlardan profillər",
      "Kür sahili görüşlər üçün məkan tövsiyələri",
      "Sakit həyat tərzi sevənlər üçün ideal",
      "Təhlükəsiz tanışlıq mühiti"
    ],
    metaTitle: "Mingəçevirdə Tanışlıq - Ciddi Münasibət və Evlilik | Danyeri",
    metaDescription: "Mingəçevirdə ciddi tanışlıq və evlilik üçün Danyeri tətbiqi. İşıqlar şəhərində həyat yoldaşınızı tapın. Pulsuz qeydiyyat!"
  },
  {
    slug: "lenkaran",
    name: "Lənkəran",
    nameLocative: "Lənkəranda",
    population: "85 min",
    description: "Lənkəranda tanışlıq və ciddi münasibət qurmaq istəyirsiniz? Danyeri ilə Lənkəranda və Cənub bölgəsində yaşayan insanlarla tanış olun.",
    longDescription: "Lənkəran, Azərbaycanın cənubunda yerləşən gözəl və təbii gözəlliklərlə zəngin şəhərdir. Xəzər dənizi sahilində yerləşən bu şəhərdə yaşayan insanlar üçün Danyeri, etibarlı tanışlıq imkanları təqdim edir. Lənkəranın zəngin mədəniyyəti və qonaqpərvər insanları, burada tanışlığı xüsusi edir. Astara, Masallı və digər cənub rayonlarından da istifadəçilər qoşulur.",
    features: [
      "Lənkəran və cənub bölgəsindən profillər",
      "Talış mədəniyyətinə hörmətlə yanaşma",
      "Bölgə bazlı uyğunlaşdırma",
      "Həm şəhər, həm rayon sakinləri üçün"
    ],
    metaTitle: "Lənkəranda Tanışlıq - Ciddi Münasibət və Evlilik | Danyeri",
    metaDescription: "Lənkəranda və cənub bölgəsində ciddi tanışlıq üçün Danyeri-yə qoşulun. Lənkəranda həyat yoldaşınızı tapın!"
  },
  {
    slug: "seki",
    name: "Şəki",
    nameLocative: "Şəkidə",
    population: "65 min",
    description: "Şəkidə tanışlıq və ciddi münasibət axtarırsınız? UNESCO irs siyahısına daxil olan bu tarixi şəhərdə Danyeri ilə həyat yoldaşınızı tapın.",
    longDescription: "Şəki, UNESCO Dünya İrs Siyahısına daxil edilmiş tarixi şəhərdir. Xan Sarayı, zəngin sənətkarlıq ənənələri və gözəl təbiəti ilə tanınan bu şəhərdə yaşayan insanlar üçün Danyeri, ciddi tanışlıq platforması təqdim edir. Şəkinin mədəni zənginliyi və ənənəvi dəyərləri, burada qurulan münasibətləri xüsusi edir. Balakən, Zaqatala və digər şimal-qərb rayonlarından da istifadəçilər var.",
    features: [
      "Şəki və şimal-qərb bölgəsindən profillər",
      "Ənənəvi dəyərlərə hörmət",
      "Tarixi şəhərdə romantik görüşlər",
      "Yoxlanılmış profillər"
    ],
    metaTitle: "Şəkidə Tanışlıq - Ciddi Münasibət və Evlilik | Danyeri",
    metaDescription: "Şəkidə ciddi tanışlıq və evlilik üçün Danyeri tətbiqi. Tarixi şəhərdə həyat yoldaşınızı tapın. Pulsuz qeydiyyat!"
  },
  {
    slug: "naxcivan",
    name: "Naxçıvan",
    nameLocative: "Naxçıvanda",
    population: "110 min",
    description: "Naxçıvanda tanışlıq və ciddi münasibət qurmaq istəyirsiniz? Danyeri ilə Naxçıvan Muxtar Respublikasında yaşayan insanlarla tanış olun.",
    longDescription: "Naxçıvan, Azərbaycanın muxtar respublikasıdır və zəngin tarixi ilə seçilir. Əshabi-Kəhf ziyarətgahı, Möminə Xatun türbəsi və digər tarixi abidələrlə tanınan bu bölgədə yaşayan insanlar üçün Danyeri, etibarlı tanışlıq platforması təqdim edir. Naxçıvanın güclü ailə dəyərləri və ənənələri, burada tanışlığı xüsusi və mənalı edir. Şərur, Ordubad, Culfa və digər rayonlardan istifadəçilər qoşulur.",
    features: [
      "Naxçıvan Muxtar Respublikasından profillər",
      "Güclü ailə dəyərlərinə söykənən platform",
      "Bütün Naxçıvan rayonlarından istifadəçilər",
      "Ciddi niyyətli münasibətlər üçün"
    ],
    metaTitle: "Naxçıvanda Tanışlıq - Ciddi Münasibət və Evlilik | Danyeri",
    metaDescription: "Naxçıvanda ciddi tanışlıq və evlilik üçün Danyeri-yə qoşulun. Muxtar Respublikada həyat yoldaşınızı tapın!"
  }
];

export function getCityBySlug(slug: string): CityData | undefined {
  return cities.find(city => city.slug === slug);
}

export function getAllCitySlugs(): string[] {
  return cities.map(city => city.slug);
}
