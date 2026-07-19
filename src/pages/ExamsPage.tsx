import { ChevronLeft, ChevronRight, FileCheck2, Headphones, Loader2, Mic2, Save, Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import {
  ApiError,
  approveExamResult,
  getExamResult,
  getExamResults,
  mediaUrl,
  rejectExamResult,
  startExamReview,
  type ExamResult,
} from '../lib/api';

function fmtDateTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Backend statusCode'iga qarab rang tanlaymiz (aniq nomlar backenddan keladi).
function statusTone(code: string | null): 'green' | 'red' | 'blue' | 'yellow' {
  const c = (code || '').toLowerCase();
  if (c.includes('approv') || c.includes('complet') || c.includes('yakun')) return 'green';
  if (c.includes('reject') || c.includes('rad')) return 'red';
  if (c.includes('review') || c.includes('tekshir')) return 'blue';
  return 'yellow';
}

const nz = (n: number | null | undefined) => (typeof n === 'number' ? n : 0);

export function ExamsPage() {
  const [items, setItems] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Tanlangan natijaning to'liq ma'lumoti (writing/speaking summary bilan)
  const [selected, setSelected] = useState<ExamResult | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [scores, setScores] = useState({ reading: 0, listening: 0, writing: 0, speaking: 0 });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (search: string, pending: boolean, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getExamResults({ search, pendingOnly: pending, page: p, pageSize: 20 });
      setItems(res.items);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Imtihon natijalarini yuklab bo’lmadi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Qidiruv/filtrni sal kechikish bilan (har harfda so'rov yubormaslik uchun)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load(query, pendingOnly, 1);
    }, 400);
    return () => clearTimeout(t);
  }, [query, pendingOnly, load]);

  useEffect(() => {
    load(query, pendingOnly, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openDetail = async (row: ExamResult) => {
    setSelected(row);
    setScores({ reading: nz(row.readingScore), listening: nz(row.listeningScore), writing: nz(row.writingScore), speaking: nz(row.speakingScore) });
    setDetailLoading(true);
    try {
      const full = await getExamResult(row.id);
      setSelected(full);
      setScores({ reading: nz(full.readingScore), listening: nz(full.listeningScore), writing: nz(full.writingScore), speaking: nz(full.speakingScore) });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Tafsilotlarni yuklab bo’lmadi');
    } finally {
      setDetailLoading(false);
    }
  };

  const beginReview = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await startExamReview(selected.id);
      setSelected(updated);
      toast.success('Tekshirish boshlandi');
      load(query, pendingOnly, page);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Boshlab bo’lmadi');
    } finally {
      setSaving(false);
    }
  };

  const approve = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await approveExamResult({
        examResultId: selected.id,
        readingScore: scores.reading,
        listeningScore: scores.listening,
        writingScore: scores.writing,
        speakingScore: scores.speaking,
      });
      toast.success('Natija tasdiqlandi');
      setSelected(null);
      load(query, pendingOnly, page);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Tasdiqlab bo’lmadi');
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    if (!selected) return;
    const reason = window.prompt('Rad etish sababini kiriting:');
    if (!reason) return;
    setSaving(true);
    try {
      await rejectExamResult(selected.id, reason);
      toast.success('Natija rad etildi');
      setSelected(null);
      load(query, pendingOnly, page);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Rad etib bo’lmadi');
    } finally {
      setSaving(false);
    }
  };

  const finalScore = Math.round((scores.reading + scores.listening + scores.writing + scores.speaking) / 4);

  return <div className="space-y-5">
    <Card className="p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#303a46] bg-[#111820] px-3 py-2.5"><Search size={18} className="text-[#758290]"/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="O‘quvchi yoki imtihon bo‘yicha qidiring"/></div>
      <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#303a46] bg-[#111820] px-4 py-2.5 text-sm font-bold"><input type="checkbox" checked={pendingOnly} onChange={e=>setPendingOnly(e.target.checked)} className="accent-[#58cc02]"/>Faqat tekshiriladiganlar</label>
    </div></Card>

    <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="border-b border-[#29333e] bg-[#151c24]"><tr>{['O‘quvchi','Imtihon','Daraja','Reading','Listening','Writing','Speaking','Yuborilgan','Holati',''].map(h=><th key={h} className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#758291]">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#252f39]">
      {loading ? <tr><td colSpan={10} className="px-5 py-16 text-center text-[#768391]"><Loader2 className="mx-auto animate-spin"/><p className="mt-3 text-sm">Yuklanmoqda...</p></td></tr>
      : error ? <tr><td colSpan={10} className="px-5 py-16 text-center"><p className="text-sm text-[#ff7777]">{error}</p><button onClick={()=>load(query,pendingOnly,page)} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></td></tr>
      : items.length===0 ? <tr><td colSpan={10} className="px-5 py-16 text-center text-sm text-[#768391]">Imtihon natijasi topilmadi</td></tr>
      : items.map(x=><tr key={x.id} className="hover:bg-[#151d26]"><td className="px-5 py-4"><div><p className="font-extrabold">{x.studentName||'O‘quvchi'}</p><p className="text-xs text-[#768391]">{x.username?`@${x.username}`:'—'}</p></div></td><td className="px-5 py-4"><Badge tone="purple">{x.examTypeName||x.examTypeCode||'—'}</Badge></td><td className="px-5 py-4"><Badge tone="blue">{x.levelCode||'—'}</Badge></td><td className="px-5 py-4 font-black">{x.readingScore??'—'}</td><td className="px-5 py-4 font-black">{x.listeningScore??'—'}</td><td className="px-5 py-4 font-black">{x.writingScore??'—'}</td><td className="px-5 py-4 font-black">{x.speakingScore??'—'}</td><td className="px-5 py-4 text-sm text-[#8d99a6]">{fmtDateTime(x.submittedAt)}</td><td className="px-5 py-4"><Badge tone={statusTone(x.statusCode)}>{x.statusName||x.statusCode||'—'}</Badge></td><td className="px-5 py-4"><Button variant="secondary" onClick={()=>openDetail(x)}>Tekshirish</Button></td></tr>)}
    </tbody></table></div><div className="flex items-center justify-between border-t border-[#29333e] px-5 py-4"><p className="text-sm text-[#7e8a98]">Jami {totalCount} ta natija</p><div className="flex items-center gap-2"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="rounded-xl border border-[#303a46] p-2 disabled:opacity-40"><ChevronLeft size={17}/></button><span className="rounded-xl bg-[var(--accent)] px-3 py-1.5 font-black text-[#142008]">{page}</span><button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="rounded-xl border border-[#303a46] p-2 disabled:opacity-40"><ChevronRight size={17}/></button></div></div></Card>

    <Modal open={!!selected} title="Imtihonni tekshirish" onClose={()=>setSelected(null)} wide>{selected&&<div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#121922] p-4">
        <div><h3 className="text-lg font-black">{selected.studentName||'O‘quvchi'}</h3><p className="text-sm text-[#84919f]">{selected.username?`@${selected.username}`:'—'} · {selected.examTypeName||selected.examTypeCode||'—'} · {selected.levelCode||'—'}</p></div>
        <Badge tone={statusTone(selected.statusCode)}>{selected.statusName||selected.statusCode||'—'}</Badge>
      </div>
      {detailLoading ? <div className="py-16 text-center text-[#768391]"><Loader2 className="mx-auto animate-spin"/><p className="mt-3 text-sm">Tafsilotlar yuklanmoqda...</p></div>
      : <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111820] p-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 font-black"><FileCheck2 className="text-[#ce82ff]"/>Writing javobi</h3>{selected.writing&&<Badge tone="gray">{selected.writing.wordCount} so‘z</Badge>}</div>
            {selected.writing ? <>
              <p className="whitespace-pre-line text-sm leading-7 text-[#b6c0ca]">{selected.writing.contentPreview||'Matn mavjud emas'}</p>
              {selected.writing.aiScore!=null&&<div className="mt-3 rounded-xl bg-[#18212a] p-3 text-sm"><span className="font-bold text-[#ce82ff]">AI bahosi:</span> {selected.writing.aiScore}{selected.writing.aiFeedback?` — ${selected.writing.aiFeedback}`:''}</div>}
            </> : <p className="text-sm text-[#768391]">Writing javobi yo‘q</p>}
          </div>
          <div className="rounded-2xl bg-[#111820] p-4">
            <h3 className="flex items-center gap-2 font-black"><Mic2 className="text-[#1cb0f6]"/>Speaking yozuvi</h3>
            {selected.speaking ? <div className="mt-3 space-y-3">
              {selected.speaking.audioUrl ? <audio controls src={mediaUrl(selected.speaking.audioUrl)} className="w-full"/> :<div className="flex items-center gap-3 rounded-2xl border border-[#2e3944] bg-[#151d26] p-4 text-sm text-[#768391]"><Headphones size={18}/>Audio mavjud emas</div>}
              {selected.speaking.durationSeconds!=null&&<p className="text-xs text-[#768391]">Davomiyligi: {selected.speaking.durationSeconds}s{selected.speaking.aiScore!=null?` · AI: ${selected.speaking.aiScore}`:''}</p>}
              {selected.speaking.transcription&&<p className="whitespace-pre-line text-sm leading-7 text-[#b6c0ca]">{selected.speaking.transcription}</p>}
            </div> : <p className="mt-3 text-sm text-[#768391]">Speaking javobi yo‘q</p>}
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-[#2d3742] bg-[#111820] p-4">
          <h3 className="font-black">Admin bahosi</h3>
          {([['reading','Reading'],['listening','Listening'],['writing','Writing'],['speaking','Speaking']] as const).map(([key,label])=>
            <label key={key} className="block"><div className="mb-2 flex justify-between text-sm font-bold"><span>{label}</span><span>{scores[key]}/100</span></div><input type="range" min={0} max={100} value={scores[key]} onChange={e=>setScores(s=>({...s,[key]:+e.target.value}))} className="w-full accent-[#58cc02]"/></label>
          )}
          <div className="rounded-2xl bg-[#58cc02]/10 p-4 text-center"><p className="text-xs font-bold uppercase text-[#73d648]">Yakuniy natija</p><p className="mt-1 text-4xl font-black">{finalScore}</p></div>
          <div className="space-y-2">
            <Button className="w-full" disabled={saving} onClick={approve}>{saving?<Loader2 size={18} className="animate-spin"/>:<Save size={18}/>}Tasdiqlash</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" disabled={saving} onClick={beginReview}>Tekshirishni boshlash</Button>
              <Button variant="danger" disabled={saving} onClick={reject}><X size={17}/>Rad etish</Button>
            </div>
          </div>
        </div>
      </div>}
    </div>}</Modal>
  </div>;
}
