export interface Dhikr {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  target: number;
  virtue?: string;
}

export const tasbeehPresets: Dhikr[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subḥānallāh",
    meaning: "Glory be to Allah",
    target: 33,
    virtue: "A tree is planted for you in Paradise with each tasbih.",
  },
  {
    id: "alhamdulillah",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Al-ḥamdu lillāh",
    meaning: "All praise is for Allah",
    target: 33,
    virtue: "It fills the scales on the Day of Judgement.",
  },
  {
    id: "allahuakbar",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allāhu akbar",
    meaning: "Allah is the Greatest",
    target: 34,
    virtue: "Completes the 100 that erase sins after prayer.",
  },
  {
    id: "tahlil",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Lā ilāha illallāhu waḥdahū lā sharīka lah…",
    meaning: "There is no god but Allah alone, without partner",
    target: 100,
    virtue: "The best of what the prophets said.",
  },
  {
    id: "istighfar",
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullāha wa atūbu ilayh",
    meaning: "I seek Allah’s forgiveness and turn to Him",
    target: 100,
    virtue: "Relief from every worry and provision from where you do not expect.",
  },
  {
    id: "salawat",
    arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    transliteration: "Allāhumma ṣalli wa sallim ‘alā nabiyyinā Muḥammad",
    meaning: "O Allah, send blessings and peace upon our Prophet Muhammad",
    target: 100,
    virtue: "Whoever sends one blessing, Allah sends ten upon him.",
  },
  {
    id: "bihamdih",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subḥānallāhi wa biḥamdih",
    meaning: "Glory and praise be to Allah",
    target: 100,
    virtue: "Sins fall away even if they are like the foam of the sea.",
  },
  {
    id: "hawqala",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Lā ḥawla wa lā quwwata illā billāh",
    meaning: "There is no power or strength except with Allah",
    target: 100,
    virtue: "A treasure from the treasures of Paradise.",
  },
  {
    id: "azim",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    transliteration: "Subḥānallāhi wa biḥamdih, subḥānallāhil-‘aẓīm",
    meaning: "Glory and praise be to Allah; glory be to Allah, the Great",
    target: 100,
    virtue: "Two words, light on the tongue, heavy on the scales.",
  },
  {
    id: "hasbunallah",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Ḥasbunallāhu wa ni‘mal-wakīl",
    meaning: "Allah is sufficient for us, and He is the best Disposer of affairs",
    target: 100,
    virtue: "The supplication of the prophets in the face of hardship.",
  },
  {
    id: "ya-hayyu",
    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ",
    transliteration: "Yā Ḥayyu yā Qayyūm, biraḥmatika astaghīth",
    meaning: "O Ever-Living, O Sustainer, by Your mercy I seek relief",
    target: 100,
    virtue: "Said by the Prophet ﷺ whenever a hardship descended.",
  },
  {
    id: "rabbi-ighfir",
    arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ",
    transliteration: "Rabbighfir lī wa tub ‘alayya",
    meaning: "My Lord, forgive me and accept my repentance",
    target: 100,
    virtue: "The Prophet ﷺ said it a hundred times in one sitting.",
  },
];

export const targetOptions = [33, 99, 100, 1000];
