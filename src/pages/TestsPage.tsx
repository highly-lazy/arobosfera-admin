import { BookOpenCheck, Loader2, Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import {
  ApiError, createQuestion, deleteQuestion, getQuestions, levelLabel, LEVELS,
  updateQuestion, type Question, type QuestionOption,
} from '../lib/api';

// Backend savol turlari/kategoriyalari uchun nom bermaydi — mavjud ID'lar shular.
const TYPE_IDS = [1, 2, 3, 4];
const CATEGORY_IDS = [1, 2, 3, 4, 5, 6, 7];

const emptyOption = (i: number): QuestionOption => ({ optionText: '', isCorrect: i === 0, orderIndex: i });

export function TestsPage() {
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState(0); // 0 = Barchasi, aks holda languageLevelId
  const [total, setTotal] = useState(0);

  // Tahrirlash (mavjud savol) va yaratish (yangi savol) alohida holatlar
  const [editing, setEditing] = useState<Question | null>(null);
  const [creating, setCreating] = useState<null | {
    questionTypeId: number; categoryId: number; languageLevelId: number;
    text: string; points: number; options: QuestionOption[];
  }>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getQuestions({ languageLevelId: levelFilter || undefined, activeOnly: true, pageSize: 50 });
      setItems(res.items);
      setTotal(res.totalCount);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Savollarni yuklab bo’lmadi');
    } finally {
      setLoading(false);
    }
  }, [levelFilter]);

  useEffect(() => { load(); }, [load]);

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateQuestion(editing.id, { text: editing.text ?? '', isActive: editing.isActive, points: editing.points });
      toast.success('Savol yangilandi');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Saqlab bo’lmadi');
    } finally {
      setSaving(false);
    }
  };

  const saveCreate = async () => {
    if (!creating) return;
    if (!creating.text.trim()) return toast.error('Savol matnini kiriting');
    const opts = creating.options.filter((o) => o.optionText.trim());
    if (opts.length < 2) return toast.error('Kamida 2 ta variant kiriting');
    if (!opts.some((o) => o.isCorrect)) return toast.error('To‘g‘ri variantni belgilang');
    setSaving(true);
    try {
      await createQuestion({
        questionTypeId: creating.questionTypeId,
        categoryId: creating.categoryId,
        languageLevelId: creating.languageLevelId,
        text: creating.text,
        points: creating.points,
        options: opts.map((o, i) => ({ ...o, orderIndex: i })),
      });
      toast.success('Yangi savol qo‘shildi');
      setCreating(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Yaratib bo’lmadi');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (q: Question) => {
    try {
      await deleteQuestion(q.id);
      await load();
      // Backend delete ishlamasa savol qolib ketishi mumkin
      toast.success('O‘chirish so‘rovi yuborildi');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'O‘chirib bo’lmadi');
    }
  };

  const startCreate = () => setCreating({ questionTypeId: 1, categoryId: 1, languageLevelId: 1, text: '', points: 1, options: [emptyOption(0), emptyOption(1)] });

  return <div className="space-y-5">
    <Card className="p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div><h2 className="text-lg font-black">Savollar ombori</h2><p className="text-sm text-[#7f8c99]">Jami {total} ta faol savol</p></div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <select value={levelFilter} onChange={(e) => setLevelFilter(+e.target.value)} className="rounded-2xl border border-[#303a46] bg-[#111820] px-4 py-2.5 text-sm outline-none">
          <option value={0}>Barcha darajalar</option>
          {LEVELS.map((l, i) => <option key={l} value={i + 1}>{l}</option>)}
        </select>
        <Button onClick={startCreate}><Plus size={19} />Yangi savol</Button>
      </div>
    </div></Card>

    {loading ? <div className="flex flex-col items-center py-24 text-[#768391]"><Loader2 className="animate-spin" /><p className="mt-3 text-sm">Yuklanmoqda...</p></div>
    : error ? <div className="flex flex-col items-center py-24"><p className="text-sm text-[#ff7777]">{error}</p><button onClick={load} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></div>
    : items.length === 0 ? <Card><div className="flex flex-col items-center py-16 text-center text-[#768391]"><BookOpenCheck size={40} className="opacity-40" /><p className="mt-3 font-bold">Hali savol yo‘q</p><p className="text-sm">“Yangi savol” tugmasi orqali birinchi savolni qo‘shing.</p></div></Card>
    : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((q) => <Card key={q.id} className="flex flex-col">
        <div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#58cc02]/15 text-[#70d93d]"><BookOpenCheck /></div><Badge tone={q.isActive ? 'green' : 'gray'}>{q.isActive ? 'Faol' : 'Nofaol'}</Badge></div>
        <p className="mt-4 line-clamp-3 min-h-[3.6rem] font-bold">{q.text || '(matnsiz)'}</p>
        <div className="mt-3 flex flex-wrap gap-2"><Badge tone="purple">{levelLabel(q.languageLevelId)}</Badge><Badge tone="blue">{q.points} ball</Badge><Badge tone="gray">Tur {q.questionTypeId}</Badge>{q.options.length > 0 && <Badge tone="gray">{q.options.length} variant</Badge>}</div>
        <div className="mt-4 flex items-center justify-end gap-1 border-t border-[#252f39] pt-3">
          <button onClick={() => setEditing(q)} className="rounded-xl p-2 hover:bg-[#28323e]"><Edit3 size={17} /></button>
          <button onClick={() => remove(q)} className="rounded-xl p-2 text-[#ff7171] hover:bg-[#ff4b4b]/10"><Trash2 size={17} /></button>
        </div>
      </Card>)}</div>}

    {/* Tahrirlash modali (text/points/holat) */}
    <Modal open={!!editing} title="Savolni tahrirlash" onClose={() => setEditing(null)}>{editing && <div className="space-y-4">
      <label className="block"><span className="mb-2 block text-sm font-bold">Savol matni</span><textarea value={editing.text ?? ''} onChange={(e) => setEditing({ ...editing, text: e.target.value })} rows={3} className="w-full rounded-2xl border border-[#303a46] bg-[#111820] px-4 py-3 outline-none" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="mb-2 block text-sm font-bold">Ball</span><input type="number" value={editing.points} onChange={(e) => setEditing({ ...editing, points: +e.target.value })} className="w-full rounded-2xl border border-[#303a46] bg-[#111820] px-4 py-3 outline-none" /></label>
        <label className="flex cursor-pointer items-end gap-3 pb-1"><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="h-5 w-5 accent-[#58cc02]" /><span className="text-sm font-bold">Faol savol</span></label>
      </div>
      <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setEditing(null)}>Bekor qilish</Button><Button disabled={saving} onClick={saveEdit}>{saving ? <Loader2 size={18} className="animate-spin" /> : null}Saqlash</Button></div>
    </div>}</Modal>

    {/* Yaratish modali (to'liq) */}
    <Modal open={!!creating} title="Yangi savol qo‘shish" onClose={() => setCreating(null)}>{creating && <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label><span className="mb-2 block text-sm font-bold">Daraja</span><select value={creating.languageLevelId} onChange={(e) => setCreating({ ...creating, languageLevelId: +e.target.value })} className="w-full rounded-2xl border border-[#303a46] bg-[#111820] px-3 py-3 outline-none">{LEVELS.map((l, i) => <option key={l} value={i + 1}>{l}</option>)}</select></label>
        <label><span className="mb-2 block text-sm font-bold">Savol turi</span><select value={creating.questionTypeId} onChange={(e) => setCreating({ ...creating, questionTypeId: +e.target.value })} className="w-full rounded-2xl border border-[#303a46] bg-[#111820] px-3 py-3 outline-none">{TYPE_IDS.map((t) => <option key={t} value={t}>Tur {t}</option>)}</select></label>
        <label><span className="mb-2 block text-sm font-bold">Kategoriya</span><select value={creating.categoryId} onChange={(e) => setCreating({ ...creating, categoryId: +e.target.value })} className="w-full rounded-2xl border border-[#303a46] bg-[#111820] px-3 py-3 outline-none">{CATEGORY_IDS.map((c) => <option key={c} value={c}>Kategoriya {c}</option>)}</select></label>
      </div>
      <label className="block"><span className="mb-2 block text-sm font-bold">Savol matni</span><textarea value={creating.text} onChange={(e) => setCreating({ ...creating, text: e.target.value })} rows={2} className="w-full rounded-2xl border border-[#303a46] bg-[#111820] px-4 py-3 outline-none" placeholder="Savol matnini kiriting" /></label>
      <label className="block w-32"><span className="mb-2 block text-sm font-bold">Ball</span><input type="number" min={1} value={creating.points} onChange={(e) => setCreating({ ...creating, points: +e.target.value })} className="w-full rounded-2xl border border-[#303a46] bg-[#111820] px-4 py-3 outline-none" /></label>
      <div><div className="mb-2 flex items-center justify-between"><span className="text-sm font-bold">Variantlar</span><button onClick={() => setCreating({ ...creating, options: [...creating.options, emptyOption(creating.options.length)] })} className="rounded-lg bg-[#27313d] px-3 py-1.5 text-xs font-bold">+ Variant</button></div>
        <div className="space-y-2">{creating.options.map((o, i) => <div key={i} className="flex items-center gap-2">
          <button title="To‘g‘ri javob" onClick={() => setCreating({ ...creating, options: creating.options.map((x, j) => ({ ...x, isCorrect: j === i })) })} className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${o.isCorrect ? 'border-[#58cc02] bg-[#58cc02]/20 text-[#58cc02]' : 'border-[#303a46] text-[#5f6b78]'}`}><Check size={16} /></button>
          <input value={o.optionText} onChange={(e) => setCreating({ ...creating, options: creating.options.map((x, j) => j === i ? { ...x, optionText: e.target.value } : x) })} className="flex-1 rounded-xl border border-[#303a46] bg-[#111820] px-3 py-2.5 text-sm outline-none" placeholder={`Variant ${i + 1}`} />
          {creating.options.length > 2 && <button onClick={() => setCreating({ ...creating, options: creating.options.filter((_, j) => j !== i) })} className="rounded-xl p-2 text-[#ff7171] hover:bg-[#ff4b4b]/10"><X size={16} /></button>}
        </div>)}</div>
      </div>
      <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setCreating(null)}>Bekor qilish</Button><Button disabled={saving} onClick={saveCreate}>{saving ? <Loader2 size={18} className="animate-spin" /> : null}Qo‘shish</Button></div>
    </div>}</Modal>
  </div>;
}
