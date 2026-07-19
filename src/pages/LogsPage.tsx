import { Activity, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  ApiError,
  auditActor,
  auditDetails,
  auditTime,
  getAuditLogs,
  type AuditLog,
} from '../lib/api';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Amal turiga qarab rang (yaratish=yashil, o'chirish=qizil, kirish=binafsha, ...)
function actionTone(action: string | null): 'green' | 'red' | 'blue' | 'yellow' | 'purple' {
  const a = (action || '').toLowerCase();
  if (a.includes('creat') || a.includes('add') || a.includes('qo')) return 'green';
  if (a.includes('delet') || a.includes('remov') || a.includes('ban')) return 'red';
  if (a.includes('login') || a.includes('kir')) return 'purple';
  if (a.includes('updat') || a.includes('edit') || a.includes('yangi')) return 'yellow';
  return 'blue';
}

export function LogsPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async (a: string, e: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAuditLogs({ action: a || undefined, entityType: e || undefined, page: p, pageSize: 30 });
      setItems(res.items);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Jurnalni yuklab bo’lmadi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(action, entityType, 1); }, 400);
    return () => clearTimeout(t);
  }, [action, entityType, load]);

  useEffect(() => {
    load(action, entityType, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return <div className="space-y-5">
    <Card className="p-4"><div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#303a46] bg-[#111820] px-3 py-2.5"><Search size={18} className="text-[#758290]" /><input value={action} onChange={(e) => setAction(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Amal bo‘yicha (masalan: Create, Login, Update)" /></div>
      <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#303a46] bg-[#111820] px-3 py-2.5"><Search size={18} className="text-[#758290]" /><input value={entityType} onChange={(e) => setEntityType(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Obyekt turi bo‘yicha (masalan: User, Question)" /></div>
    </div></Card>

    <Card>
      <div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-black">Audit jurnali</h2><p className="text-sm text-[#7f8c99]">Barcha tizim va admin harakatlari</p></div><Badge tone="green">● Jonli</Badge></div>

      {loading ? <div className="py-16 text-center text-[#768391]"><Loader2 className="mx-auto animate-spin" /><p className="mt-3 text-sm">Yuklanmoqda...</p></div>
      : error ? <div className="py-16 text-center"><p className="text-sm text-[#ff7777]">{error}</p><button onClick={() => load(action, entityType, page)} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></div>
      : items.length === 0 ? <div className="py-16 text-center text-[#768391]"><Activity className="mx-auto" size={28} /><p className="mt-3 text-sm">Jurnal yozuvlari topilmadi</p></div>
      : <div className="space-y-1">{items.map((l, i) => <div key={l.id ?? i} className="relative flex gap-4 rounded-2xl p-4 hover:bg-[#121922]">
          <div className="relative"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#202b35]"><Activity size={20} /></div>{i < items.length - 1 && <span className="absolute left-1/2 top-11 h-8 w-px bg-[#303a46]" />}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-extrabold">{l.action || 'Harakat'}{l.entityType ? ` · ${l.entityType}${l.entityId != null ? ` #${l.entityId}` : ''}` : ''}</p>
              <div className="flex items-center gap-2"><Badge tone={actionTone(l.action ?? null)}>{l.action || '—'}</Badge><span className="text-xs text-[#768391]">{fmtTime(auditTime(l))}</span></div>
            </div>
            <p className="mt-1 text-sm text-[#7f8c99]">{auditActor(l)}{l.ipAddress ? ` · ${l.ipAddress}` : ''}{auditDetails(l) ? ` · ${auditDetails(l)}` : ''}</p>
          </div>
        </div>)}</div>}

      {!loading && !error && items.length > 0 && <div className="mt-4 flex items-center justify-between border-t border-[#29333e] pt-4"><p className="text-sm text-[#7e8a98]">Jami {totalCount} ta yozuv</p><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border border-[#303a46] p-2 disabled:opacity-40"><ChevronLeft size={17} /></button><span className="rounded-xl bg-[var(--accent)] px-3 py-1.5 font-black text-[#142008]">{page}</span><button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-[#303a46] p-2 disabled:opacity-40"><ChevronRight size={17} /></button></div></div>}
    </Card>
  </div>;
}
