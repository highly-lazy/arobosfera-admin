import { BellRing, CheckCheck, Loader2, MailOpen } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  ApiError,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notifBody,
  notifIsRead,
  type AppNotification,
} from '../lib/api';

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async (unread: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications({ unreadOnly: unread, pageSize: 50 });
      setItems(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Bildirishnomalarni yuklab bo’lmadi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(unreadOnly); }, [load, unreadOnly]);

  const markOne = async (n: AppNotification) => {
    if (notifIsRead(n)) return;
    setBusyId(n.id);
    try {
      await markNotificationRead(n.id);
      setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, isRead: true, read: true } : x)));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Belgilash amalga oshmadi');
    } finally {
      setBusyId(null);
    }
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      toast.success('Barcha bildirishnomalar o‘qilgan deb belgilandi');
      load(unreadOnly);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Amalga oshmadi');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = items.filter((n) => !notifIsRead(n)).length;

  return <div className="mx-auto max-w-3xl space-y-5">
    <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ce82ff]/15 text-[#ce82ff]"><BellRing /></div><div><h2 className="font-black">Bildirishnomalar</h2><p className="text-sm text-[#7f8c99]">{unreadCount > 0 ? `${unreadCount} ta o‘qilmagan` : 'Hammasi o‘qilgan'}</p></div></div>
      <div className="flex items-center gap-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#303a46] bg-[#111820] px-4 py-2.5 text-sm font-bold"><input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} className="accent-[#58cc02]" />Faqat o‘qilmagan</label>
        <Button variant="secondary" disabled={markingAll || unreadCount === 0} onClick={markAll}>{markingAll ? <Loader2 size={17} className="animate-spin" /> : <CheckCheck size={17} />}Barchasini o‘qilgan</Button>
      </div>
    </div></Card>

    {loading ? <Card className="py-16 text-center text-[#768391]"><Loader2 className="mx-auto animate-spin" /><p className="mt-3 text-sm">Yuklanmoqda...</p></Card>
    : error ? <Card className="py-16 text-center"><p className="text-sm text-[#ff7777]">{error}</p><button onClick={() => load(unreadOnly)} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></Card>
    : items.length === 0 ? <Card className="py-16 text-center text-[#768391]"><MailOpen className="mx-auto" size={30} /><p className="mt-3 text-sm">{unreadOnly ? 'O‘qilmagan bildirishnoma yo‘q' : 'Hozircha bildirishnoma yo‘q'}</p></Card>
    : <div className="space-y-3">{items.map((n) => {
        const read = notifIsRead(n);
        return <Card key={n.id} className={`p-4 ${read ? 'opacity-70' : ''}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${read ? 'bg-[#3a4653]' : 'bg-[#58cc02]'}`} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-extrabold">{n.title || 'Bildirishnoma'}</h3>
                <div className="flex items-center gap-2">{n.notificationTypeName && <Badge tone="purple">{n.notificationTypeName}</Badge>}<span className="text-xs text-[#768391]">{fmtDateTime(n.createdAt)}</span></div>
              </div>
              {notifBody(n) && <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#b6c0ca]">{notifBody(n)}</p>}
              {!read && <button onClick={() => markOne(n)} disabled={busyId === n.id} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#27313d] px-3 py-1.5 text-xs font-bold text-[#c3ccd5] hover:bg-[#2f3a45] disabled:opacity-50">{busyId === n.id ? <Loader2 size={14} className="animate-spin" /> : <MailOpen size={14} />}O‘qilgan deb belgilash</button>}
            </div>
          </div>
        </Card>;
      })}</div>}
  </div>;
}
