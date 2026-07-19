import { Ban, ChevronLeft, ChevronRight, Edit3, Loader2, Search, ShieldCheck, UserRoundCog } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ApiError, banUser, getUsers, updateUser, type AdminUser } from '../lib/api';

function initials(u: AdminUser) {
  const name = u.fullName || u.firstName || u.username || '?';
  return name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();
}

function subTone(code: string | null) {
  if (code === 'VIP') return 'purple';
  if (code === 'Premium') return 'yellow';
  return 'gray';
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (search: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers({ search, page: p, pageSize: 20 });
      setUsers(res.items);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Foydalanuvchilarni yuklab bo’lmadi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Qidiruvni server tomonda, sal kechikish bilan bajaramiz (har harfda so'rov yubormaslik uchun)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load(query, 1);
    }, 400);
    return () => clearTimeout(t);
  }, [query, load]);

  useEffect(() => {
    load(query, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const update = (patch: Partial<AdminUser>) => {
    if (!selected) return;
    setSelected({ ...selected, ...patch });
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateUser(selected, {
        firstName: selected.firstName,
        lastName: selected.lastName,
        username: selected.username,
        xp: selected.xp,
      });
      toast.success('O‘zgarishlar saqlandi');
      setSelected(null);
      load(query, page);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Saqlab bo’lmadi');
    } finally {
      setSaving(false);
    }
  };

  const ban = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await banUser(selected.id, 'Admin panel orqali bloklandi');
      toast.success('Foydalanuvchi bloklandi');
      setSelected(null);
      load(query, page);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Bloklab bo’lmadi');
    } finally {
      setSaving(false);
    }
  };

  return <div className="space-y-5">
    <Card className="p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#303a46] bg-[#111820] px-3 py-2.5"><Search size={18} className="text-[#758290]"/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Ism, username yoki telefon bo‘yicha qidiring"/></div><Button><UserRoundCog size={18}/>Yangi foydalanuvchi</Button></div></Card>
    <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="border-b border-[#29333e] bg-[#151c24]"><tr>{['O‘quvchi','Daraja','XP','Progres','Obuna','Holati','Oxirgi faollik','Amallar'].map(h=><th key={h} className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#758291]">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#252f39]">
      {loading ? <tr><td colSpan={8} className="px-5 py-16 text-center text-[#768391]"><Loader2 className="mx-auto animate-spin" /><p className="mt-3 text-sm">Yuklanmoqda...</p></td></tr>
      : error ? <tr><td colSpan={8} className="px-5 py-16 text-center"><p className="text-sm text-[#ff7777]">{error}</p><button onClick={()=>load(query,page)} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></td></tr>
      : users.length===0 ? <tr><td colSpan={8} className="px-5 py-16 text-center text-[#768391] text-sm">Foydalanuvchi topilmadi</td></tr>
      : users.map(s=><tr key={s.id} className="hover:bg-[#151d26]"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#23303b] font-black text-[#74d94b]">{initials(s)}</div><div><p className="font-extrabold">{s.fullName||s.firstName||'Foydalanuvchi'}</p><p className="text-xs text-[#768391]">{s.username?`@${s.username}`:'—'} · {s.phoneNumber||'—'}</p></div></div></td><td className="px-5 py-4"><Badge tone="blue">{s.cefrLevelCode||'—'}</Badge></td><td className="px-5 py-4 font-extrabold">{s.xp.toLocaleString()}</td><td className="px-5 py-4"><div className="w-36"><div className="mb-1 flex justify-between text-xs"><span className="text-[#7f8c99]">Natija</span><b>{s.progressPercent}%</b></div><div className="h-2 rounded-full bg-[#26313c]"><div className="h-full rounded-full bg-[var(--accent)]" style={{width:`${s.progressPercent}%`}}/></div></div></td><td className="px-5 py-4"><Badge tone={subTone(s.subscriptionCode)}>{s.subscriptionName||'Bepul'}</Badge></td><td className="px-5 py-4"><Badge tone={s.isBanned?'red':'green'}>{s.isBanned?'Bloklangan':'Faol'}</Badge></td><td className="px-5 py-4 text-sm text-[#9aa7b4]">{fmtDate(s.lastActiveAt)}</td><td className="px-5 py-4"><button onClick={()=>setSelected(s)} className="rounded-xl p-2 text-[#8fa0b0] hover:bg-[#27313d] hover:text-white"><Edit3 size={18}/></button></td></tr>)}
    </tbody></table></div><div className="flex items-center justify-between border-t border-[#29333e] px-5 py-4"><p className="text-sm text-[#7e8a98]">Jami {totalCount} ta foydalanuvchi</p><div className="flex items-center gap-2"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="rounded-xl border border-[#303a46] p-2 disabled:opacity-40"><ChevronLeft size={17}/></button><span className="rounded-xl bg-[var(--accent)] px-3 py-1.5 font-black text-[#142008]">{page}</span><button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="rounded-xl border border-[#303a46] p-2 disabled:opacity-40"><ChevronRight size={17}/></button></div></div></Card>
    <Modal open={!!selected} title="Foydalanuvchi profilini boshqarish" onClose={()=>setSelected(null)}>{selected&&<div className="space-y-5"><div className="flex items-center gap-4 rounded-2xl bg-[#121922] p-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#263440] text-xl font-black text-[#74d94b]">{initials(selected)}</div><div><h3 className="text-lg font-black">{selected.fullName||selected.firstName||'Foydalanuvchi'}</h3><p className="text-sm text-[#84919f]">{selected.username?`@${selected.username}`:'—'} · {selected.subscriptionName||'Bepul'}</p></div></div><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-bold text-[#a0acb8]">Ism</span><input value={selected.firstName??''} onChange={e=>update({firstName:e.target.value})} className="w-full rounded-2xl border border-[#303a46] bg-[#111820] px-4 py-3 outline-none"/></label><label><span className="mb-2 block text-sm font-bold text-[#a0acb8]">Familiya</span><input value={selected.lastName??''} onChange={e=>update({lastName:e.target.value})} className="w-full rounded-2xl border border-[#303a46] bg-[#111820] px-4 py-3 outline-none"/></label><label><span className="mb-2 block text-sm font-bold text-[#a0acb8]">Username</span><input value={selected.username??''} onChange={e=>update({username:e.target.value})} className="w-full rounded-2xl border border-[#303a46] bg-[#111820] px-4 py-3 outline-none"/></label><label><span className="mb-2 block text-sm font-bold text-[#a0acb8]">XP miqdori</span><input type="number" value={selected.xp} onChange={e=>update({xp:+e.target.value})} className="w-full rounded-2xl border border-[#303a46] bg-[#111820] px-4 py-3 outline-none"/></label></div><div className="flex flex-wrap justify-end gap-3">{!selected.isBanned&&<Button variant="danger" disabled={saving} onClick={ban}><Ban size={18}/>Bloklash</Button>}{selected.isBanned&&<span className="flex items-center gap-2 rounded-2xl bg-[#ff4b4b]/10 px-4 py-2 text-sm font-bold text-[#ff7777]"><ShieldCheck size={17}/>Bloklangan</span>}<Button disabled={saving} onClick={save}>{saving?<Loader2 size={18} className="animate-spin"/>:null}Saqlash</Button></div></div>}</Modal>
  </div>;
}
