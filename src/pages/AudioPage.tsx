import { FileAudio, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ApiError, deleteAudio, getAudios, mediaUrl, uploadAudio, type AudioFile } from '../lib/api';

function fmtSize(bytes: number) {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function AudioPage() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAudios({ pageSize: 48 });
      setFiles(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Audiolarni yuklab bo’lmadi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // bir xil faylni qayta tanlash mumkin bo'lsin
    if (!file) return;
    setUploading(true);
    try {
      await uploadAudio(file);
      toast.success('Audio yuklandi');
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Yuklab bo’lmadi');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (f: AudioFile) => {
    if (!window.confirm(`"${f.originalFileName}" o‘chirilsinmi?`)) return;
    setDeletingId(f.id);
    try {
      await deleteAudio(f.id);
      toast.success('Audio o‘chirildi');
      setFiles((xs) => xs.filter((x) => x.id !== f.id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'O’chirib bo’lmadi');
    } finally {
      setDeletingId(null);
    }
  };

  return <div className="space-y-5">
    <input ref={inputRef} type="file" accept="audio/*,.mp3,.wav,.m4a" onChange={onPick} className="hidden" />
    <Card><div className="rounded-3xl border-2 border-dashed border-[#3a4653] bg-[#111820] p-8 text-center">
      <UploadCloud className="mx-auto text-[#1cb0f6]" size={38} />
      <h2 className="mt-3 text-lg font-black">Audio fayl yuklash</h2>
      <p className="mt-1 text-sm text-[#7f8c99]">MP3, WAV yoki M4A</p>
      <Button className="mt-4" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}{uploading ? 'Yuklanmoqda...' : 'Audio tanlash'}</Button>
    </div></Card>

    {loading ? <Card className="py-16 text-center text-[#768391]"><Loader2 className="mx-auto animate-spin" /><p className="mt-3 text-sm">Yuklanmoqda...</p></Card>
    : error ? <Card className="py-16 text-center"><p className="text-sm text-[#ff7777]">{error}</p><button onClick={load} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></Card>
    : files.length === 0 ? <Card className="py-16 text-center text-sm text-[#768391]">Hozircha audio fayllar yo‘q</Card>
    : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{files.map((f) => <Card key={f.id}>
        <div className="flex items-start justify-between"><div className="rounded-2xl bg-[#1cb0f6]/15 p-3 text-[#1cb0f6]"><FileAudio /></div><Badge tone="gray">{fmtSize(f.sizeBytes)}</Badge></div>
        <h3 className="mt-4 break-words font-black">{f.originalFileName || 'Audio'}</h3>
        <p className="mt-1 text-sm text-[#7f8c99]">{f.mimeType || '—'} · {fmtDate(f.createdAt)}</p>
        {f.url && <audio controls src={mediaUrl(f.url)} className="mt-3 w-full" />}
        <div className="mt-4 flex justify-end">
          <button onClick={() => remove(f)} disabled={deletingId === f.id} className="rounded-2xl bg-[#ff4b4b]/10 px-3 py-2 text-[#ff7373] disabled:opacity-50">{deletingId === f.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}</button>
        </div>
      </Card>)}</div>}
  </div>;
}
