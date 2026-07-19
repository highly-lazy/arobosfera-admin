import { Activity, Archive, Database, Download, FileBarChart, HardDriveDownload, Loader2, RefreshCw, Server, Users2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  ApiError,
  createBackup,
  exportData,
  generateReport,
  getBackupList,
  getSystemInfo,
  getSystemStatus,
  serverFileUrl,
  type Backup,
  type SystemInfo,
  type SystemStatus,
} from '../lib/api';

const tabs = [['status', 'Tizim holati'], ['backup', 'Eksport & Zaxira'], ['reports', 'Hisobotlar']] as const;
type Tab = typeof tabs[number][0];

const EXPORT_FORMATS = [[1, 'JSON'], [2, 'CSV']] as const;
const DATA_TYPES = ['Users', 'Questions', 'ExamResults', 'Audios'];
const REPORT_TYPES = ['Summary', 'Users', 'Exams'];

function fmtSize(bytes: number) {
  if (!bytes) return '0 B';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return kb >= 1 ? `${kb.toFixed(1)} KB` : `${bytes} B`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function download(filePath: string | null) {
  const url = serverFileUrl(filePath);
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.click();
}

export function AdvancedPage() {
  const [tab, setTab] = useState<Tab>('status');

  // Tizim holati
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const [s, i] = await Promise.all([getSystemStatus(), getSystemInfo()]);
      setStatus(s);
      setInfo(i);
    } catch (err) {
      setStatusError(err instanceof ApiError ? err.message : 'Tizim holatini yuklab bo’lmadi');
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // Zaxira ro'yxati
  const [backups, setBackups] = useState<Backup[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(1);
  const [dataType, setDataType] = useState('Users');

  const loadBackups = useCallback(async () => {
    setBackupLoading(true);
    try {
      setBackups(await getBackupList());
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Zaxira ro’yxatini yuklab bo’lmadi');
    } finally {
      setBackupLoading(false);
    }
  }, []);

  useEffect(() => { if (tab === 'backup') loadBackups(); }, [tab, loadBackups]);

  const runBackup = async () => {
    setBackingUp(true);
    try {
      await createBackup(1);
      toast.success('Zaxira nusxasi yaratildi');
      loadBackups();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Zaxira yaratib bo’lmadi');
    } finally {
      setBackingUp(false);
    }
  };

  const runExport = async () => {
    setExporting(true);
    try {
      const job = await exportData(exportFormat, dataType);
      if (job.filePath) {
        toast.success('Eksport tayyor — yuklab olinmoqda');
        download(job.filePath);
      } else {
        toast.success(`Eksport holati: ${job.status || 'boshlandi'}`);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Eksport amalga oshmadi');
    } finally {
      setExporting(false);
    }
  };

  // Hisobotlar
  const [reportType, setReportType] = useState('Summary');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [generating, setGenerating] = useState(false);

  const runReport = async () => {
    setGenerating(true);
    try {
      const res = await generateReport({ reportType, from: from || undefined, to: to || undefined });
      if (res.filePath) {
        toast.success('Hisobot tayyor — yuklab olinmoqda');
        download(res.filePath);
      } else {
        toast.error('Hisobot fayli qaytmadi');
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Hisobot yaratib bo’lmadi');
    } finally {
      setGenerating(false);
    }
  };

  const kpis = status ? [
    { label: 'Jami foydalanuvchi', value: status.totalUsers, icon: Users2, color: '#58cc02' },
    { label: 'Faol foydalanuvchi', value: status.activeUsers, icon: Activity, color: '#1cb0f6' },
    { label: 'Test sessiyalari', value: status.totalTestSessions, icon: Database, color: '#ce82ff' },
    { label: 'PvP o‘yinlari', value: status.totalPvpMatches, icon: Server, color: '#ffc800' },
    { label: 'Imtihon natijalari', value: status.totalExamResults, icon: FileBarChart, color: '#ff8c42' },
    { label: 'O‘rtacha test balli', value: Math.round(status.averageTestScore), icon: Activity, color: '#ff4b4b' },
  ] : [];

  return <div className="space-y-5">
    <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">{tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-black transition ${tab === id ? 'bg-[var(--accent)] text-[#132008] shadow-[0_4px_0_var(--accent-dark)]' : 'border border-[#303a46] bg-[#151c24] text-[#9aa7b4] hover:text-white'}`}>{label}</button>)}</div>

    {tab === 'status' && (statusLoading ? <Card className="py-16 text-center text-[#768391]"><Loader2 className="mx-auto animate-spin" /><p className="mt-3 text-sm">Yuklanmoqda...</p></Card>
      : statusError ? <Card className="py-16 text-center"><p className="text-sm text-[#ff7777]">{statusError}</p><button onClick={loadStatus} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></Card>
      : <div className="space-y-5">
        <Card><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#58cc02]/15 text-[#58cc02]"><Server /></div><div><h2 className="text-lg font-black">{info?.name || 'Tizim'}</h2><p className="text-sm text-[#7f8c99]">Versiya {info?.version || '—'}</p></div></div><div className="flex items-center gap-2"><Badge tone={info?.environment === 'Production' ? 'green' : 'yellow'}>{info?.environment || '—'}</Badge><Button variant="secondary" onClick={loadStatus}><RefreshCw size={16} />Yangilash</Button></div></div></Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{kpis.map((k) => <Card key={k.label}><div className="flex items-start justify-between"><div className="rounded-2xl p-3" style={{ background: `${k.color}22`, color: k.color }}><k.icon /></div></div><p className="mt-4 text-3xl font-black">{k.value.toLocaleString()}</p><p className="mt-1 text-sm text-[#7f8c99]">{k.label}</p></Card>)}</div>
      </div>)}

    {tab === 'backup' && <div className="grid gap-5 lg:grid-cols-2">
      <Card><div className="rounded-2xl bg-[#1cb0f6]/15 p-3 text-[#1cb0f6] w-fit"><Download /></div><h3 className="mt-4 text-lg font-black">Ma'lumotlarni eksport qilish</h3><p className="mt-2 text-sm text-[#7f8c99]">Tanlangan ma'lumot turini fayl sifatida yuklab oling.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label><span className="mb-1.5 block text-xs font-bold text-[#8d99a6]">Ma'lumot turi</span><select value={dataType} onChange={(e) => setDataType(e.target.value)} className="w-full rounded-xl border border-[#303a46] bg-[#111820] px-3 py-2.5 text-sm outline-none">{DATA_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}</select></label>
          <label><span className="mb-1.5 block text-xs font-bold text-[#8d99a6]">Format</span><select value={exportFormat} onChange={(e) => setExportFormat(+e.target.value)} className="w-full rounded-xl border border-[#303a46] bg-[#111820] px-3 py-2.5 text-sm outline-none">{EXPORT_FORMATS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select></label>
        </div>
        <Button className="mt-4 w-full" disabled={exporting} onClick={runExport}>{exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}Eksport qilish</Button>
      </Card>

      <Card><div className="flex items-start justify-between"><div className="rounded-2xl bg-[#58cc02]/15 p-3 text-[#58cc02] w-fit"><Archive /></div><Button variant="secondary" disabled={backingUp} onClick={runBackup}>{backingUp ? <Loader2 size={16} className="animate-spin" /> : <HardDriveDownload size={16} />}Zaxira yaratish</Button></div>
        <h3 className="mt-4 text-lg font-black">Zaxira nusxalari</h3>
        <div className="mt-4 space-y-2">
          {backupLoading ? <div className="py-8 text-center text-[#768391]"><Loader2 className="mx-auto animate-spin" size={20} /></div>
          : backups.length === 0 ? <p className="py-8 text-center text-sm text-[#768391]">Zaxira nusxalari yo‘q</p>
          : backups.map((b) => <div key={b.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#111820] p-3">
              <div className="min-w-0"><p className="truncate text-sm font-bold">{fmtDate(b.createdAt)}</p><p className="text-xs text-[#768391]">{fmtSize(b.sizeBytes)} · <Badge tone={b.status === 'Completed' ? 'green' : 'yellow'}>{b.status}</Badge></p></div>
              <button onClick={() => download(b.filePath)} className="shrink-0 rounded-xl bg-[#27313d] p-2.5 text-[#c3ccd5] hover:bg-[#2f3a45]"><Download size={17} /></button>
            </div>)}
        </div>
      </Card>
    </div>}

    {tab === 'reports' && <Card className="mx-auto max-w-xl"><div className="rounded-2xl bg-[#ce82ff]/15 p-3 text-[#ce82ff] w-fit"><FileBarChart /></div><h3 className="mt-4 text-lg font-black">Administrator hisoboti</h3><p className="mt-2 text-sm text-[#7f8c99]">Tanlangan davr uchun hisobot yarating (PDF).</p>
      <div className="mt-5 space-y-4">
        <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#8d99a6]">Hisobot turi</span><select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full rounded-xl border border-[#303a46] bg-[#111820] px-3 py-2.5 text-sm outline-none">{REPORT_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#8d99a6]">Boshlanish</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-xl border border-[#303a46] bg-[#111820] px-3 py-2.5 text-sm outline-none" /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#8d99a6]">Tugash</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-xl border border-[#303a46] bg-[#111820] px-3 py-2.5 text-sm outline-none" /></label>
        </div>
        <Button className="w-full" disabled={generating} onClick={runReport}>{generating ? <Loader2 size={18} className="animate-spin" /> : <FileBarChart size={18} />}Hisobot yaratish va yuklab olish</Button>
      </div>
    </Card>}
  </div>;
}
