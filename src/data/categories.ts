export type CategoryId =
  | "morning"
  | "evening"
  | "quran"
  | "salah"
  | "ruqya"
  | "distress"
  | "forgiveness"
  | "travel"
  | "daily";

export type IconName =
  | "sunrise"
  | "moon"
  | "quran"
  | "mosque"
  | "pulse"
  | "cloud"
  | "sparkle"
  | "compass"
  | "home";

export interface Category {
  id: CategoryId;
  name: string;
  nameAr: string;
  tagline: string;
  description: string;
  icon: IconName;
  hue: string;
  featured?: boolean;
}

export const categories: Category[] = [
  {
    id: "morning",
    name: "Morning Adhkar",
    nameAr: "أذكار الصباح",
    tagline: "Begin with light",
    description:
      "The Prophetic remembrances recited after Fajr until the sun rises — a shield for your day, from dawn to dusk.",
    icon: "sunrise",
    hue: "34",
    featured: true,
  },
  {
    id: "evening",
    name: "Evening Adhkar",
    nameAr: "أذكار المساء",
    tagline: "Settle into stillness",
    description:
      "Recite after Asr until the night falls. The same protection, re-centred for the quiet hours.",
    icon: "moon",
    hue: "248",
    featured: true,
  },
  {
    id: "quran",
    name: "Qur’anic Duas",
    nameAr: "أدعية قرآنية",
    tagline: "Words of the Divine",
    description:
      "Supplications spoken directly in the Qur’an — the most eloquent way to ask, preserved exactly as revealed.",
    icon: "quran",
    hue: "158",
  },
  {
    id: "salah",
    name: "After Salah",
    nameAr: "أذكار بعد الصلاة",
    tagline: "Seal the prayer",
    description:
      "What the Prophet ﷺ said after the salam — istighfar, tasbih and the quiet requests that follow the meeting with Allah.",
    icon: "mosque",
    hue: "190",
  },
  {
    id: "ruqya",
    name: "Ruqya & Healing",
    nameAr: "الرقية الشرعية",
    tagline: "Seek the cure",
    description:
      "Authentic Qur’anic and Prophetic recitations for illness, pain, the evil eye and protection of loved ones.",
    icon: "pulse",
    hue: "352",
  },
  {
    id: "distress",
    name: "Anxiety & Hardship",
    nameAr: "دعاء الهم والحزن",
    tagline: "When the heart is heavy",
    description:
      "Duas for worry, grief, debt and overwhelm — words that widen the chest when everything feels narrow.",
    icon: "cloud",
    hue: "210",
  },
  {
    id: "forgiveness",
    name: "Forgiveness",
    nameAr: "الاستغفار والتوبة",
    tagline: "Return and be renewed",
    description:
      "Istighfar and the supplications of repentance, with the promise of mercy for whoever turns back.",
    icon: "sparkle",
    hue: "272",
  },
  {
    id: "travel",
    name: "Travel & Journey",
    nameAr: "دعاء السفر",
    tagline: "Go with protection",
    description:
      "From mounting your ride to entering a new city — the words that keep the traveller under Allah’s care.",
    icon: "compass",
    hue: "18",
  },
  {
    id: "daily",
    name: "Everyday Life",
    nameAr: "أدعية الحياة اليومية",
    tagline: "Sanctify the ordinary",
    description:
      "Eating, sleeping, leaving home, wearing something new — small moments turned into worship with a single sentence.",
    icon: "home",
    hue: "128",
  },
];

export const categoryById = (id: CategoryId): Category =>
  categories.find((c) => c.id === id) ?? categories[0];
