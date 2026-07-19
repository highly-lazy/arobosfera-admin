import { Loader2, Palette, Save, Settings2, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ApiError, getSettings, updateSetting, type SystemSetting } from '../lib/api';

const isBool = (s: SystemSetting) => (s.dataType || '').toLowerCase() === 'bool';
const isNumeric = (s: SystemSetting) => ['int', 'integer', 'number', 'decimal', 'long'].includes((s.dataType || '').toLowerCase());
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({}); // key -> tahrirlangan qiymat
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSettings();
      setSettings(res);
      setDraft(Object.fromEntries(res.map((s) => [s.key, s.value])));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sozlamalarni yuklab bo’lmadi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Accent rang — bu backend sozlamasi emas, faqat lokal UI didi (localStorage).
  const setAccent = (a: string, d: string) => {
    document.documentElement.style.setProperty('--accent', a);
    document.documentElement.style.setProperty('--accent-dark', d);
    localStorage.setItem('arabosfera-accent', JSON.stringify([a, d]));
  };

  const setVal = (key: string, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const dirty = useMemo(() => settings.filter((s) => draft[s.key] !== s.value), [settings, draft]);

  const groups = useMemo(() => {
    const map: Record<string, SystemSetting[]> = {};
    for (const s of settings) (map[s.category || 'Boshqa'] ||= []).push(s);
    return Object.entries(map);
  }, [settings]);

  const saveAll = async () => {
    if (!dirty.length) return;
    setSaving(true);
    let ok = 0, fail = 0;
    for (const s of dirty) {
      try {
        await updateSetting(s.key, draft[s.key]);
        ok++;
      } catch { fail++; }
      await sleep(300); // Render ketma-ket yozishi uchun
    }
    setSaving(false);
    if (fail) toast.error(`${ok} ta saqlandi, ${fail} tasida xatolik`);
    else toast.success(`${ok} ta sozlama saqlandi`);
    load();
  };

  return <div className="space-y-6">
    <Card><h2 className="flex items-center gap-2 text-lg font-black"><Palette className="text-[#ce82ff]" />Rang va ko‘rinish</h2><p className="mt-1 text-sm text-[#7f8c99]">Admin panelning accent rangini tanlang (faqat shu qurilmada)</p><div className="mt-5 flex gap-3">{[['#58cc02', '#46a302'], ['#1cb0f6', '#1188be'], ['#ce82ff', '#a45bd3'], ['#ffc800', '#c79d00'], ['#ff4b4b', '#c93232']].map(([a, d]) => <button key={a} onClick={() => setAccent(a, d)} className="h-12 w-12 rounded-2xl border-4 border-[#111820] ring-1 ring-[#3a4653]" style={{ background: a }} />)}</div></Card>

    {loading ? <Card className="py-16 text-center text-[#768391]"><Loader2 className="mx-auto animate-spin" /><p className="mt-3 text-sm">Yuklanmoqda...</p></Card>
    : error ? <Card className="py-16 text-center"><p className="text-sm text-[#ff7777]">{error}</p><button onClick={load} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></Card>
    : settings.length === 0 ? <Card className="py-16 text-center text-sm text-[#768391]">Tizim sozlamalari topilmadi</Card>
    : <>
      {groups.map(([category, list]) => <Card key={category}>
        <h2 className="flex items-center gap-2 text-lg font-black"><Settings2 className="text-[#58cc02]" />{category}</h2>
        <div className="mt-5 space-y-4">{list.map((s) => <div key={s.key} className="flex flex-col gap-3 rounded-2xl bg-[#111820] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><p className="font-black">{s.description || s.key}</p><p className="mt-0.5 truncate text-xs text-[#6b7885]">{s.key} · <Badge tone="gray">{s.dataType}</Badge></p></div>
          <div className="shrink-0">
            {isBool(s)
              ? <button onClick={() => setVal(s.key, draft[s.key] === 'true' ? 'false' : 'true')} className={`h-7 w-12 rounded-full p-1 transition ${draft[s.key] === 'true' ? 'bg-[#58cc02]' : 'bg-[#3a4551]'}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${draft[s.key] === 'true' ? 'translate-x-5' : ''}`} /></button>
              : <input type={isNumeric(s) ? 'number' : 'text'} value={draft[s.key] ?? ''} onChange={(e) => setVal(s.key, e.target.value)} className="w-full min-w-[180px] rounded-2xl border border-[#303a46] bg-[#0e141b] px-4 py-2.5 text-sm outline-none focus:border-[#58cc02] sm:w-64" />}
          </div>
        </div>)}</div>
      </Card>)}

      <Card><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><ShieldCheck className="text-[#58cc02]" /><div><h3 className="font-black">Tizim sozlamalarini saqlash</h3><p className="text-sm text-[#7f8c99]">{dirty.length > 0 ? `${dirty.length} ta o‘zgarish saqlanmagan` : 'O‘zgarishlar yo‘q'}</p></div></div><Button disabled={saving || dirty.length === 0} onClick={saveAll}>{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}Sozlamalarni saqlash</Button></div></Card>
    </>}
  </div>;
}
