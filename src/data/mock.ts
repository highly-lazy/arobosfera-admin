import type { Battle, ExamSubmission, Student, TestItem } from '../types';

export const studentsSeed: Student[] = [
  { id: '1', name: 'Devnodir Karimov', username: '@devnodir', phone: '+998 90 123 45 67', level: 'B2', xp: 12450, progress: 82, streak: 28, subscription: 'VIP', status: 'Faol', isOnline: true, lastActive: 'Hozir' },
  { id: '2', name: 'Madina Soliyeva', username: '@madina_s', phone: '+998 93 221 10 10', level: 'B1', xp: 10900, progress: 74, streak: 17, subscription: 'Premium', status: 'Faol', isOnline: true, lastActive: '2 daqiqa oldin' },
  { id: '3', name: 'Shohrux Alimov', username: '@shohrux', phone: '+998 99 718 19 20', level: 'C1', xp: 11820, progress: 91, streak: 42, subscription: 'VIP', status: 'Faol', isOnline: false, lastActive: '18 daqiqa oldin' },
  { id: '4', name: 'Aziza Mirzayeva', username: '@aziza', phone: '+998 97 800 22 11', level: 'A2', xp: 5320, progress: 49, streak: 6, subscription: 'Bepul', status: 'Faol', isOnline: true, lastActive: 'Hozir' },
  { id: '5', name: 'Muhammad Yusuf', username: '@m_yusuf', phone: '+998 95 554 33 22', level: 'B1', xp: 7350, progress: 63, streak: 11, subscription: 'Premium', status: 'Faol', isOnline: false, lastActive: '1 soat oldin' },
  { id: '6', name: 'Zarnigor Xasanova', username: '@zarnigor', phone: '+998 88 321 98 76', level: 'A1', xp: 2150, progress: 31, streak: 4, subscription: 'Bepul', status: 'Bloklangan', isOnline: false, lastActive: '3 kun oldin' },
  { id: '7', name: 'Javohir Ergashev', username: '@javohir', phone: '+998 91 876 12 31', level: 'B2', xp: 9650, progress: 78, streak: 21, subscription: 'Premium', status: 'Faol', isOnline: true, lastActive: 'Hozir' },
  { id: '8', name: 'Rayhona Usmonova', username: '@rayhona', phone: '+998 94 120 45 90', level: 'A2', xp: 4480, progress: 44, streak: 8, subscription: 'Bepul', status: 'Faol', isOnline: false, lastActive: 'Kecha' },
];

export const testsSeed: TestItem[] = [
  { id: 't1', title: 'B2 — Matnni tushunish 01', type: 'Reading', level: 'B2', questions: 20, participants: 1280, average: 73, status: 'Faol', createdAt: '12.07.2026' },
  { id: 't2', title: 'C1 — Audio tahlil 03', type: 'Listening', level: 'C1', questions: 20, participants: 620, average: 68, status: 'Faol', createdAt: '10.07.2026' },
  { id: 't3', title: 'A2 — Kundalik lug‘at', type: 'Vocabulary', level: 'A2', questions: 15, participants: 2130, average: 81, status: 'Faol', createdAt: '08.07.2026' },
  { id: 't4', title: 'B1 — Nahv asoslari', type: 'Grammar', level: 'B1', questions: 25, participants: 950, average: 64, status: 'Qoralama', createdAt: '17.07.2026' },
];

export const submissionsSeed: ExamSubmission[] = [
  { id: 'e1', student: 'Devnodir Karimov', exam: 'CEFR', level: 'B2', reading: 84, listening: 78, submittedAt: 'Bugun, 02:14', status: 'Tekshirilmoqda', essay: 'Arab tilini o‘rganish bugungi global dunyoda yangi imkoniyatlar eshigini ochadi. Bu til nafaqat tarixiy va diniy manbalarni tushunishga, balki zamonaviy biznes hamda ta’lim aloqalarini rivojlantirishga yordam beradi...' },
  { id: 'e2', student: 'Madina Soliyeva', exam: 'at-Tanal', level: 'B1', reading: 76, listening: 72, writing: 80, speaking: 77, submittedAt: 'Kecha, 19:40', status: 'Yakunlangan', essay: 'Mening fikrimcha muntazam o‘qish va tinglash til o‘rganishdagi eng muhim odatlardan biridir...' },
  { id: 'e3', student: 'Javohir Ergashev', exam: 'CEFR', level: 'B2', reading: 71, listening: 69, submittedAt: 'Kecha, 15:15', status: 'Tekshirilmoqda', essay: 'Texnologiyalar ta’limni ancha qulaylashtirdi. Mobil ilovalar orqali istalgan joyda mashq qilish mumkin...' },
  { id: 'e4', student: 'Shohrux Alimov', exam: 'at-Tanal', level: 'C1', reading: 92, listening: 88, writing: 90, speaking: 86, submittedAt: '16.07.2026', status: 'Yakunlangan', essay: 'Zamonaviy jamiyatda ko‘p tillilik insonning kasbiy va shaxsiy rivojida strategik ustunlik beradi...' },
];

export const battlesSeed: Battle[] = [
  { id: 'b1', playerA: 'DEVNODIR', playerB: 'Shohrux', scoreA: 4, scoreB: 3, speedA: 2.4, speedB: 3.1, progress: 70, status: 'Jonli' },
  { id: 'b2', playerA: 'Madina', playerB: 'Javohir', scoreA: 6, scoreB: 6, speedA: 2.8, speedB: 2.7, progress: 80, status: 'Jonli' },
  { id: 'b3', playerA: 'Aziza', playerB: 'Rayhona', scoreA: 2, scoreB: 4, speedA: 4.1, speedB: 3.4, progress: 50, status: 'Jonli' },
];

export const activityData = [
  { name: 'Du', faol: 820, test: 510, imtihon: 115 },
  { name: 'Se', faol: 960, test: 640, imtihon: 142 },
  { name: 'Cho', faol: 910, test: 588, imtihon: 128 },
  { name: 'Pa', faol: 1120, test: 730, imtihon: 176 },
  { name: 'Ju', faol: 1250, test: 840, imtihon: 205 },
  { name: 'Sha', faol: 980, test: 620, imtihon: 158 },
  { name: 'Ya', faol: 1080, test: 690, imtihon: 181 },
];

export const levelData = [
  { name: 'A1', value: 1850 },
  { name: 'A2', value: 2760 },
  { name: 'B1', value: 3810 },
  { name: 'B2', value: 2950 },
  { name: 'C1', value: 1080 },
];

export const difficultTopics = [
  { topic: 'Nahv: fe’l zamonlari', failure: 46 },
  { topic: 'Listening: tez nutq', failure: 41 },
  { topic: 'Reading: yashirin ma’no', failure: 38 },
  { topic: 'Lug‘at: sinonimlar', failure: 34 },
  { topic: 'Imloviy qoidalar', failure: 29 },
];
