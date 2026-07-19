// Arabosfera backend bilan bog'lanish uchun markaziy API qatlami.
// Barcha sahifalar shu yerdagi funksiyalardan foydalanadi.

const BASE = import.meta.env.VITE_API_BASE ?? 'https://arabosfera.onrender.com';

const ACCESS_KEY = 'arabosfera-access-token';
const REFRESH_KEY = 'arabosfera-refresh-token';

export const tokens = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  save(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// Backenddan keladigan fayl yo'llari nisbiy ("/audios/...") bo'ladi — ularni
// to'liq URL'ga aylantiramiz (audio/rasm to'g'ridan-to'g'ri ochilishi uchun).
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export class ApiError extends Error {
  code?: string;
  status: number;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Serverga so'rov yuboradigan asosiy funksiya.
// - JSON yuboradi va JSON qabul qiladi
// - agar token bo'lsa, Authorization sarlavhasini qo'shadi
// - server xato qaytarsa, tushunarli xabar bilan ApiError chiqaradi
export async function apiFetch<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) || `Server xatosi (${res.status})`;
    throw new ApiError(message, res.status, data?.errorCode);
  }

  return data as T;
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ---- Auth ----

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: number;
  isNewUser: boolean;
  roleId: number;
}

export async function login(phoneNumber: string, password: string) {
  const res = await apiFetch<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { phoneNumber, password },
  });
  tokens.save(res.accessToken, res.refreshToken);
  return res;
}

export async function logout() {
  try {
    if (tokens.refresh) {
      await apiFetch('/auth/logout', { method: 'POST', body: { refreshToken: tokens.refresh } });
    }
  } finally {
    tokens.clear();
  }
}

export function isLoggedIn() {
  return Boolean(tokens.access);
}

// ---- Foydalanuvchilar ----

export interface AdminUser {
  id: number;
  telegramId: number | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  username: string | null;
  phoneNumber: string | null;
  avatarPath: string | null;
  roleId: number;
  isBanned: boolean;
  status: string;
  cefrLevelId: number | null;
  cefrLevelCode: string | null;
  xp: number;
  level: number;
  progressPercent: number;
  subscriptionTypeId: number;
  subscriptionCode: string | null;
  subscriptionName: string | null;
  lastActiveAt: string | null;
  createdAt: string;
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function getUsers(params: { search?: string; page?: number; pageSize?: number } = {}) {
  const q = new URLSearchParams();
  if (params.search) q.set('Search', params.search);
  q.set('Page', String(params.page ?? 1));
  q.set('PageSize', String(params.pageSize ?? 20));
  return apiFetch<Paged<AdminUser>>(`/user/getusers?${q.toString()}`);
}

// Foydalanuvchini yangilash. subscriptionTypeId majburiy, shuning uchun joriy
// qiymatlarni saqlab qolgan holda faqat kerakli maydonlarni o'zgartiramiz.
export function updateUser(u: AdminUser, patch: Partial<Pick<AdminUser, 'firstName' | 'lastName' | 'username' | 'xp'>>) {
  return apiFetch('/user/updateuser', {
    method: 'POST',
    body: {
      userId: u.id,
      firstName: patch.firstName ?? u.firstName,
      lastName: patch.lastName ?? u.lastName,
      username: patch.username ?? u.username,
      phoneNumber: u.phoneNumber,
      cefrLevelId: u.cefrLevelId,
      subscriptionTypeId: u.subscriptionTypeId,
      xp: patch.xp ?? u.xp,
    },
  });
}

export function banUser(userId: number, reason: string) {
  return apiFetch('/user/banuser', { method: 'POST', body: { userId, reason } });
}

export function deleteUser(userId: number) {
  return apiFetch('/user/deleteuser', { method: 'POST', body: { userId } });
}

// ---- Analitika ----

export interface Metric {
  value: number;
  change: number;
  changeUnit: string; // "Percent" | "Points"
}

export interface WeeklyActivityPoint {
  day: string;
  label: string;
  activeUsers: number;
  testSessions: number;
}

export interface LevelDistribution {
  code: string;
  count: number;
  percent: number;
}

export interface DashboardAnalytics {
  totalStudents: Metric;
  activeToday: Metric;
  examsSubmitted: Metric;
  averageResult: Metric;
  weeklyActivity: WeeklyActivityPoint[];
  levelDistribution: LevelDistribution[];
}

export function getDashboardAnalytics() {
  return apiFetch<DashboardAnalytics>('/analytics/getdashboard');
}

// ---- Savollar ombori ----

// languageLevelId 1..5 => A1..C1 (backend'da nomlar yo'q, standart CEFR tartibi)
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
export const levelLabel = (id: number | null) => (id && LEVELS[id - 1]) || '—';

export interface QuestionOption {
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface Question {
  id: number;
  questionTypeId: number;
  categoryId: number;
  languageLevelId: number;
  text: string | null;
  readingPassage: string | null;
  points: number;
  isActive: boolean;
  options: QuestionOption[];
}

export function getQuestions(params: { languageLevelId?: number; activeOnly?: boolean; page?: number; pageSize?: number } = {}) {
  const q = new URLSearchParams();
  if (params.languageLevelId) q.set('LanguageLevelId', String(params.languageLevelId));
  if (params.activeOnly) q.set('ActiveOnly', 'true');
  q.set('Page', String(params.page ?? 1));
  q.set('PageSize', String(params.pageSize ?? 12));
  return apiFetch<Paged<Question>>(`/question/getlist?${q.toString()}`);
}

export interface CreateQuestionInput {
  questionTypeId: number;
  categoryId: number;
  languageLevelId: number;
  text: string;
  readingPassage?: string | null;
  points: number;
  options: QuestionOption[];
}

export function createQuestion(input: CreateQuestionInput) {
  return apiFetch<Question>('/question/create', { method: 'POST', body: input });
}

// Diqqat: update faqat text/isActive/points'ni o'zgartiradi (backend cheklovi).
export function updateQuestion(id: number, patch: { text: string; isActive: boolean; points: number }) {
  return apiFetch<Question>(`/question/update?id=${id}`, { method: 'POST', body: patch });
}

export function deleteQuestion(id: number) {
  return apiFetch(`/question/delete`, { method: 'POST', body: { id } });
}

// ---- Imtihon natijalari ----

// Reading/Listening avtomatik baholanadi; Writing/Speaking'ni admin tekshiradi.
// Holatlar (examResultStatusId): backend kodlari — statusCode/statusName bilan
// birga keladi, shuning uchun UI'da nomlarni to'g'ridan-to'g'ri ishlatamiz.

export interface AdminExamWritingSummary {
  id: number;
  wordCount: number;
  status: string | null;
  aiScore: number | null;
  aiFeedback: string | null;
  contentPreview: string | null;
}

export interface AdminExamSpeakingSummary {
  id: number;
  audioUrl: string | null;
  status: string | null;
  transcription: string | null;
  aiScore: number | null;
  durationSeconds: number | null;
}

export interface ExamResult {
  id: number;
  userId: number;
  studentName: string | null;
  username: string | null;
  examDateId: number | null;
  examTypeId: number;
  examTypeCode: string | null;
  examTypeName: string | null;
  levelId: number | null;
  levelCode: string | null;
  readingScore: number | null;
  listeningScore: number | null;
  writingScore: number | null;
  speakingScore: number | null;
  totalScore: number | null;
  submittedAt: string | null;
  examResultStatusId: number;
  statusCode: string | null;
  statusName: string | null;
  certificateStatusId: number | null;
  reviewedAt: string | null;
  reviewedByUserId: number | null;
  createdAt: string;
  // faqat getById/detail javoblarida keladi:
  writing?: AdminExamWritingSummary | null;
  speaking?: AdminExamSpeakingSummary | null;
}

export function getExamResults(params: {
  search?: string;
  examTypeId?: number;
  statusId?: number;
  pendingOnly?: boolean;
  page?: number;
  pageSize?: number;
} = {}) {
  const q = new URLSearchParams();
  if (params.search) q.set('Search', params.search);
  if (params.examTypeId) q.set('ExamTypeId', String(params.examTypeId));
  if (params.statusId) q.set('ExamResultStatusId', String(params.statusId));
  if (params.pendingOnly) q.set('PendingReviewOnly', 'true');
  q.set('Page', String(params.page ?? 1));
  q.set('PageSize', String(params.pageSize ?? 20));
  return apiFetch<Paged<ExamResult>>(`/examresult/getlist?${q.toString()}`);
}

export function getExamResult(id: number) {
  return apiFetch<ExamResult>(`/examresult/getbyid?id=${id}`);
}

// Tekshirishni boshlash — natijani "ko'rib chiqilmoqda" holatiga o'tkazadi.
export function startExamReview(examResultId: number) {
  return apiFetch<ExamResult>('/examresult/startreview', {
    method: 'POST',
    body: { examResultId },
  });
}

// Natijani tasdiqlash — Writing/Speaking ballari bilan yakunlaydi.
export function approveExamResult(input: {
  examResultId: number;
  readingScore: number;
  listeningScore: number;
  writingScore: number;
  speakingScore: number;
}) {
  return apiFetch<ExamResult>('/examresult/approve', { method: 'POST', body: input });
}

export function rejectExamResult(examResultId: number, reason: string) {
  return apiFetch<ExamResult>('/examresult/reject', {
    method: 'POST',
    body: { examResultId, reason },
  });
}

// ---- Audio fayllar (Listening) ----

export interface AudioFile {
  id: number;
  originalFileName: string | null;
  url: string | null;
  relativePath: string | null;
  fileTypeId: number;
  mimeType: string | null;
  sizeBytes: number;
  createdAt: string;
}

export function getAudios(params: { fileTypeId?: number; page?: number; pageSize?: number } = {}) {
  const q = new URLSearchParams();
  if (params.fileTypeId) q.set('FileTypeId', String(params.fileTypeId));
  q.set('Page', String(params.page ?? 1));
  q.set('PageSize', String(params.pageSize ?? 24));
  return apiFetch<Paged<AudioFile>>(`/audios/getlist?${q.toString()}`);
}

// Yuklash multipart/form-data orqali (JSON emas), shuning uchun apiFetch'dan
// foydalanmaymiz — brauzer Content-Type'ni boundary bilan o'zi qo'yadi.
export async function uploadAudio(file: File): Promise<AudioFile> {
  const form = new FormData();
  form.append('file', file);
  const headers: Record<string, string> = {};
  if (tokens.access) headers.Authorization = `Bearer ${tokens.access}`;

  const res = await fetch(`${BASE}/audios/upload`, { method: 'POST', headers, body: form });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    throw new ApiError((data && (data.error || data.message)) || `Server xatosi (${res.status})`, res.status, data?.errorCode);
  }
  return data as AudioFile;
}

export function deleteAudio(fileId: number) {
  return apiFetch(`/audios/delete?fileId=${fileId}`, { method: 'POST' });
}

// ---- Bildirishnomalar (adminning o'z inbox'i) ----
// DIQQAT: backendда broadcast/yuborish endpointi YO'Q — faqat o'qish + belgilash.
// Element maydonlari swaggerda hujjatlanmagan, shuning uchun interfeys himoyalangan
// (keng tarqalgan nomlar + ixtiyoriy fallback'lar). Real data kelganda moslashadi.

export interface AppNotification {
  id: number;
  title: string | null;
  body?: string | null;
  message?: string | null;
  content?: string | null;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
  notificationTypeCode?: string | null;
  notificationTypeName?: string | null;
}

export function getNotifications(params: { unreadOnly?: boolean; page?: number; pageSize?: number } = {}) {
  const q = new URLSearchParams();
  if (params.unreadOnly) q.set('UnreadOnly', 'true');
  q.set('Page', String(params.page ?? 1));
  q.set('PageSize', String(params.pageSize ?? 20));
  return apiFetch<Paged<AppNotification>>(`/notifications/getlist?${q.toString()}`);
}

export function markNotificationRead(notificationId: number) {
  return apiFetch('/notifications/markread', { method: 'POST', body: { notificationId } });
}

export function markAllNotificationsRead() {
  return apiFetch('/notifications/markallread', { method: 'POST' });
}

// Element maydonlaridan matn/o'qilgan holatni xavfsiz ajratib olish yordamchilari.
export const notifBody = (n: AppNotification) => n.body ?? n.message ?? n.content ?? '';
export const notifIsRead = (n: AppNotification) => n.isRead ?? n.read ?? false;

// ---- Tizim sozlamalari (key/value) ----

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  category: string | null;
  dataType: string | null; // "string" | "bool" | "int" | ...
}

// DIQQAT: getall Paged emas, oddiy massiv qaytaradi.
export function getSettings() {
  return apiFetch<SystemSetting[]>('/systemsettings/getall');
}

// value doim string sifatida saqlanadi (bool uchun "true"/"false").
export function updateSetting(key: string, value: string) {
  return apiFetch<SystemSetting>('/systemsettings/update', { method: 'POST', body: { key, value } });
}

// ---- Audit jurnali (monitoring) ----
// Element maydonlari swaggerda hujjatlanmagan (bo'sh) — himoyalangan interfeys.

export interface AuditLog {
  id: number;
  userId?: number | null;
  userName?: string | null;
  userFullName?: string | null;
  action?: string | null;
  entityType?: string | null;
  entityId?: number | string | null;
  details?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  createdAt?: string | null;
  occurredAt?: string | null;
  timestamp?: string | null;
}

export function getAuditLogs(params: {
  userId?: number;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const q = new URLSearchParams();
  if (params.userId) q.set('UserId', String(params.userId));
  if (params.action) q.set('Action', params.action);
  if (params.entityType) q.set('EntityType', params.entityType);
  if (params.from) q.set('From', params.from);
  if (params.to) q.set('To', params.to);
  q.set('Page', String(params.page ?? 1));
  q.set('PageSize', String(params.pageSize ?? 30));
  return apiFetch<Paged<AuditLog>>(`/monitoring/getauditlogs?${q.toString()}`);
}

export const auditTime = (l: AuditLog) => l.createdAt ?? l.occurredAt ?? l.timestamp ?? null;
export const auditActor = (l: AuditLog) => l.userFullName ?? l.userName ?? (l.userId ? `Foydalanuvchi #${l.userId}` : 'Tizim');
export const auditDetails = (l: AuditLog) => l.details ?? l.description ?? '';

// ---- Tizim holati / Eksport / Zaxira (Advanced) ----

export interface SystemStatus {
  totalUsers: number;
  activeUsers: number;
  totalTestSessions: number;
  totalPvpMatches: number;
  totalExamResults: number;
  averageTestScore: number;
}

export interface SystemInfo {
  name: string | null;
  version: string | null;
  environment: string | null;
}

export interface Backup {
  id: number;
  backupTypeId: number;
  filePath: string | null;
  sizeBytes: number;
  status: string | null;
  createdAt: string;
}

export interface ExportJob {
  id: number;
  exportFormatId: number;
  status: string | null;
  filePath: string | null;
}

export interface ReportResult {
  filePath: string | null;
  mimeType: string | null;
  sizeBytes: number;
}

export function getSystemStatus() {
  return apiFetch<SystemStatus>('/system/getstatus');
}

export function getSystemInfo() {
  return apiFetch<SystemInfo>('/system/getinfo');
}

export function getBackupList() {
  return apiFetch<Backup[]>('/exportbackup/getbackuplist');
}

export function createBackup(backupTypeId = 1) {
  return apiFetch<Backup>('/exportbackup/backup', { method: 'POST', body: { backupTypeId } });
}

// exportFormatId: 1=JSON (tasdiqlangan). dataType: "Users", "Questions", ...
export function exportData(exportFormatId: number, dataType: string) {
  return apiFetch<ExportJob>('/exportbackup/export', { method: 'POST', body: { exportFormatId, dataType } });
}

export function generateReport(input: { reportType: string; from?: string; to?: string; parametersJson?: string }) {
  return apiFetch<ReportResult>('/reports/generateadminreport', {
    method: 'POST',
    body: { reportType: input.reportType, from: input.from ?? null, to: input.to ?? null, parametersJson: input.parametersJson ?? '{}' },
  });
}

// Server fayl yo'lini (/app/wwwroot/...) yuklab olinadigan URL'ga aylantiradi.
export function serverFileUrl(filePath: string | null | undefined): string {
  if (!filePath) return '';
  const rel = filePath.replace(/^.*?wwwroot/i, '').replace(/\\/g, '/');
  return mediaUrl(rel || filePath);
}

// ---- Oktagon: Leaderboard + PvP tarixi ----
// Leaderboard element DTO hujjatlanmagan — himoyalangan (fallback nomlar).

export interface LeaderboardEntry {
  rank?: number | null;
  position?: number | null;
  userId?: number | null;
  userName?: string | null;
  fullName?: string | null;
  studentName?: string | null;
  xp?: number | null;
  score?: number | null;
  points?: number | null;
  cefrLevelCode?: string | null;
}

export interface PvpMatch {
  id: number;
  player1Id: number;
  player2Id: number;
  pvpMatchStatusId: number;
  winnerId: number | null;
  player1Score: number;
  player2Score: number;
}

export type LeaderboardPeriod = 'global' | 'weekly' | 'monthly';

export function getLeaderboard(period: LeaderboardPeriod, params: { page?: number; pageSize?: number } = {}) {
  const q = new URLSearchParams();
  q.set('Page', String(params.page ?? 1));
  q.set('PageSize', String(params.pageSize ?? 20));
  return apiFetch<Paged<LeaderboardEntry>>(`/leaderboard/get${period}?${q.toString()}`);
}

export function getPvpHistory() {
  return apiFetch<PvpMatch[]>('/pvp/gethistory');
}

export const lbName = (e: LeaderboardEntry) => e.fullName ?? e.studentName ?? e.userName ?? (e.userId ? `Foydalanuvchi #${e.userId}` : '—');
export const lbScore = (e: LeaderboardEntry) => e.xp ?? e.score ?? e.points ?? 0;
export const lbRank = (e: LeaderboardEntry, i: number) => e.rank ?? e.position ?? i + 1;
