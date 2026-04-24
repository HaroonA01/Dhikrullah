import { CategoryId, Dhikr } from '@/types';

export const DHIKRS: Record<CategoryId, Dhikr[]> = {
  morning: [
    {
      id: 'morning-01',
      arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
      transliteration: 'SubhanAllahi wa bihamdih',
      translation: 'Glory be to Allah and praise Him',
      target: 100,
    },
    {
      id: 'morning-02',
      arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
      transliteration: 'La ilaha illa Allahu wahdahu la sharika lah',
      translation: 'There is no god but Allah, alone, without partner',
      target: 10,
    },
    {
      id: 'morning-03',
      arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
      transliteration: 'Asbahna wa asbahal-mulku lillah',
      translation: 'We have reached the morning and the dominion belongs to Allah',
      target: 1,
    },
  ],
  evening: [
    {
      id: 'evening-01',
      arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ',
      transliteration: 'Amsayna wa amsal-mulku lillah',
      translation: 'We have reached the evening and the dominion belongs to Allah',
      target: 1,
    },
    {
      id: 'evening-02',
      arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا',
      transliteration: 'Allahumma bika amsayna',
      translation: 'O Allah, by You we have reached the evening',
      target: 3,
    },
    {
      id: 'evening-03',
      arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
      transliteration: 'SubhanAllahi wa bihamdih',
      translation: 'Glory be to Allah and praise Him',
      target: 100,
    },
  ],
  night: [
    {
      id: 'night-01',
      arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
      transliteration: 'Bismika Allahumma amutu wa ahya',
      translation: 'In Your name O Allah, I die and I live',
      target: 1,
    },
    {
      id: 'night-02',
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'SubhanAllah',
      translation: 'Glory be to Allah',
      target: 33,
    },
    {
      id: 'night-03',
      arabic: 'الْحَمْدُ لِلَّهِ',
      transliteration: 'Alhamdulillah',
      translation: 'All praise is due to Allah',
      target: 33,
    },
  ],
  fajr: [
    {
      id: 'fajr-01',
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'SubhanAllah',
      translation: 'Glory be to Allah',
      target: 33,
    },
    {
      id: 'fajr-02',
      arabic: 'الْحَمْدُ لِلَّهِ',
      transliteration: 'Alhamdulillah',
      translation: 'All praise is due to Allah',
      target: 33,
    },
    {
      id: 'fajr-03',
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allahu Akbar',
      translation: 'Allah is the Greatest',
      target: 34,
    },
  ],
  dhuhr: [
    {
      id: 'dhuhr-01',
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'SubhanAllah',
      translation: 'Glory be to Allah',
      target: 33,
    },
    {
      id: 'dhuhr-02',
      arabic: 'الْحَمْدُ لِلَّهِ',
      transliteration: 'Alhamdulillah',
      translation: 'All praise is due to Allah',
      target: 33,
    },
    {
      id: 'dhuhr-03',
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allahu Akbar',
      translation: 'Allah is the Greatest',
      target: 34,
    },
  ],
  asr: [
    {
      id: 'asr-01',
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'SubhanAllah',
      translation: 'Glory be to Allah',
      target: 33,
    },
    {
      id: 'asr-02',
      arabic: 'الْحَمْدُ لِلَّهِ',
      transliteration: 'Alhamdulillah',
      translation: 'All praise is due to Allah',
      target: 33,
    },
    {
      id: 'asr-03',
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allahu Akbar',
      translation: 'Allah is the Greatest',
      target: 34,
    },
  ],
  maghrib: [
    {
      id: 'maghrib-01',
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'SubhanAllah',
      translation: 'Glory be to Allah',
      target: 33,
    },
    {
      id: 'maghrib-02',
      arabic: 'الْحَمْدُ لِلَّهِ',
      transliteration: 'Alhamdulillah',
      translation: 'All praise is due to Allah',
      target: 33,
    },
    {
      id: 'maghrib-03',
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allahu Akbar',
      translation: 'Allah is the Greatest',
      target: 34,
    },
  ],
  isha: [
    {
      id: 'isha-01',
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'SubhanAllah',
      translation: 'Glory be to Allah',
      target: 33,
    },
    {
      id: 'isha-02',
      arabic: 'الْحَمْدُ لِلَّهِ',
      transliteration: 'Alhamdulillah',
      translation: 'All praise is due to Allah',
      target: 33,
    },
    {
      id: 'isha-03',
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allahu Akbar',
      translation: 'Allah is the Greatest',
      target: 34,
    },
  ],
};

export const getDhikrsFor = (id: CategoryId): Dhikr[] => DHIKRS[id];
