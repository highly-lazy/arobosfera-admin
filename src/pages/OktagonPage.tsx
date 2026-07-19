import { Crown, Loader2, Swords } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  ApiError,
  getLeaderboard,
  getPvpHistory,
  lbName,
  lbRank,
  lbScore,
  type LeaderboardEntry,
  type LeaderboardPeriod,
  type PvpMatch,
} from '../lib/api';

const periods = [['global', 'Global'], ['weekly', 'Haftalik'], ['monthly', 'Oylik']] as const;
const rankColor = (r: number) => (r === 1 ? '#ffc800' : r === 2 ? '#c0c8d0' : r === 3 ? '#cd7f32' : '#58cc02');

export function OktagonPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [lbError, setLbError] = useState<string | null>(null);

  const [matches, setMatches] = useState<PvpMatch[]>([]);
  const [pvpLoading, setPvpLoading] = useState(true);
  const [pvpError, setPvpError] = useState<string | null>(null);

  const loadLb = useCallback(async (p: LeaderboardPeriod) => {
    setLbLoading(true);
    setLbError(null);
    try {
      const res = await getLeaderboard(p, { pageSize: 20 });
      setEntries(res.items);
    } catch (err) {
      setLbError(err instanceof ApiError ? err.message : 'Reytingni yuklab bo’lmadi');
    } finally {
      setLbLoading(false);
    }
  }, []);

  const loadPvp = useCallback(async () => {
    setPvpLoading(true);
    setPvpError(null);
    try {
      setMatches(await getPvpHistory());
    } catch (err) {
      setPvpError(err instanceof ApiError ? err.message : 'PvP tarixini yuklab bo’lmadi');
    } finally {
      setPvpLoading(false);
    }
  }, []);

  useEffect(() => { loadLb(period); }, [period, loadLb]);
  useEffect(() => { loadPvp(); }, [loadPvp]);

  return <div className="space-y-6">
    <Card>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-black"><Crown className="text-[#ffc800]" />Reyting</h2>
        <div className="flex gap-2">{periods.map(([id, label]) => <button key={id} onClick={() => setPeriod(id)} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${period === id ? 'bg-[var(--accent)] text-[#132008]' : 'border border-[#303a46] bg-[#151c24] text-[#9aa7b4] hover:text-white'}`}>{label}</button>)}</div>
      </div>
      {lbLoading ? <div className="py-16 text-center text-[#768391]"><Loader2 className="mx-auto animate-spin" /><p className="mt-3 text-sm">Yuklanmoqda...</p></div>
      : lbError ? <div className="py-16 text-center"><p className="text-sm text-[#ff7777]">{lbError}</p><button onClick={() => loadLb(period)} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></div>
      : entries.length === 0 ? <div className="py-16 text-center text-sm text-[#768391]">Bu davr uchun reyting bo‘sh</div>
      : <div className="space-y-2">{entries.map((e, i) => {
          const rank = lbRank(e, i);
          return <div key={e.userId ?? i} className="flex items-center gap-4 rounded-2xl bg-[#111820] p-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-black" style={{ background: `${rankColor(rank)}22`, color: rankColor(rank) }}>#{rank}</div>
            <div className="flex-1 min-w-0"><p className="truncate font-extrabold">{lbName(e)}</p>{e.cefrLevelCode && <p className="text-xs text-[#768391]">{e.cefrLevelCode}</p>}</div>
            <p className="shrink-0 font-black text-[#78dc48]">{lbScore(e).toLocaleString()} XP</p>
          </div>;
        })}</div>}
    </Card>

    <Card>
      <h2 className="mb-5 flex items-center gap-2 text-lg font-black"><Swords className="text-[#ff4b4b]" />PvP janglar tarixi</h2>
      {pvpLoading ? <div className="py-16 text-center text-[#768391]"><Loader2 className="mx-auto animate-spin" /><p className="mt-3 text-sm">Yuklanmoqda...</p></div>
      : pvpError ? <div className="py-16 text-center"><p className="text-sm text-[#ff7777]">{pvpError}</p><button onClick={loadPvp} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></div>
      : matches.length === 0 ? <div className="py-16 text-center text-sm text-[#768391]">Hozircha PvP janglar yo‘q</div>
      : <div className="grid gap-4 lg:grid-cols-2">{matches.map((m) => {
          const p1win = m.winnerId === m.player1Id;
          const p2win = m.winnerId === m.player2Id;
          return <div key={m.id} className="rounded-3xl border border-[#303a46] bg-[#111820] p-5">
            <div className="mb-4 flex items-center justify-between"><Badge tone="gray">Jang #{m.id}</Badge>{m.winnerId ? <Badge tone="green">G‘olib #{m.winnerId}</Badge> : <Badge tone="yellow">Durang / tugallanmagan</Badge>}</div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
              <div><div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl text-lg font-black ${p1win ? 'bg-[#58cc02]/20 text-[#78dc48]' : 'bg-[#1cb0f6]/15 text-[#55c7ff]'}`}>{m.player1Id}</div><p className="mt-2 text-sm font-black">Player #{m.player1Id}</p></div>
              <div className="rounded-2xl bg-[#ff4b4b]/10 p-3 font-black text-[#ff6f6f]">VS</div>
              <div><div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl text-lg font-black ${p2win ? 'bg-[#58cc02]/20 text-[#78dc48]' : 'bg-[#ce82ff]/15 text-[#dcadff]'}`}>{m.player2Id}</div><p className="mt-2 text-sm font-black">Player #{m.player2Id}</p></div>
            </div>
            <div className="mt-5 flex items-center justify-center gap-5 text-3xl font-black"><span className={p1win ? 'text-[#78dc48]' : ''}>{m.player1Score}</span><span className="text-[#53606d]">:</span><span className={p2win ? 'text-[#78dc48]' : ''}>{m.player2Score}</span></div>
          </div>;
        })}</div>}
    </Card>
  </div>;
}
