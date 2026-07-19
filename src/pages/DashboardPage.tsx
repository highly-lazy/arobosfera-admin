import { Activity, BookCheck, CircleAlert, Clock3, Flame, GraduationCap, Headphones, Loader2, Swords, UserRoundCheck, Users, type LucideIcon } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { studentsSeed } from '../data/mock';
import { useNavigate } from 'react-router-dom';
import { formatChange, useDashboard } from '../hooks/useDashboard';

const colors = ['#58cc02', '#1cb0f6', '#ffc800', '#ce82ff', '#ff4b4b'];

export function DashboardPage() {
  const nav = useNavigate();
  const { data, loading, error, reload } = useDashboard();
  const activityData = (data?.weeklyActivity ?? []).map((w) => ({ name: w.label, faol: w.activeUsers, test: w.testSessions }));
  const levelData = (data?.levelDistribution ?? []).map((l) => ({ name: l.code, value: l.count }));
  const leaders = [...studentsSeed].sort((a,b) => b.xp-a.xp).slice(0,5);
  const reviewItems: { icon: LucideIcon; title: string; sub: string; color: string }[] = [
    { icon: BookCheck, title: '18 ta insho', sub: 'Writing javoblari', color: '#ce82ff' },
    { icon: Headphones, title: '12 ta ovozli javob', sub: 'Speaking yozuvlari', color: '#1cb0f6' },
    { icon: CircleAlert, title: '7 ta ogohlantirish', sub: 'Anti-cheat holatlari', color: '#ff4b4b' },
    { icon: Clock3, title: '4 ta murojaat', sub: 'Qo‘llab-quvvatlash', color: '#ffc800' },
  ];
  const quickActions: { label: string; icon: LucideIcon; path: string }[] = [
    { label: 'Yangi test yaratish', icon: BookCheck, path: '/testlar' },
    { label: 'Audio yuklash', icon: Headphones, path: '/audio' },
    { label: 'Bildirishnoma yuborish', icon: Activity, path: '/bildirishnomalar' },
    { label: 'Oktagonni kuzatish', icon: Swords, path: '/oktagon' },
  ];
  if (loading) return <div className="flex flex-col items-center py-32 text-[#768391]"><Loader2 className="animate-spin" /><p className="mt-3 text-sm">Yuklanmoqda...</p></div>;
  if (error || !data) return <div className="flex flex-col items-center py-32"><p className="text-sm text-[#ff7777]">{error ?? 'Ma’lumot yo’q'}</p><button onClick={reload} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></div>;

  return <div className="space-y-6">
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Jami o‘quvchilar" value={data.totalStudents.value.toLocaleString()} change={formatChange(data.totalStudents.change, data.totalStudents.changeUnit)} icon={Users} />
      <StatCard title="Bugun faol" value={data.activeToday.value.toLocaleString()} change={formatChange(data.activeToday.change, data.activeToday.changeUnit)} icon={UserRoundCheck} accent="#1cb0f6" />
      <StatCard title="Topshirilgan imtihonlar" value={data.examsSubmitted.value.toLocaleString()} change={formatChange(data.examsSubmitted.change, data.examsSubmitted.changeUnit)} icon={BookCheck} accent="#ffc800" />
      <StatCard title="O‘rtacha natija" value={`${data.averageResult.value}%`} change={formatChange(data.averageResult.change, data.averageResult.changeUnit)} icon={GraduationCap} accent="#ce82ff" />
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Card>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black">Haftalik faollik</h2><p className="mt-1 text-sm text-[#84919f]">Platformadagi o‘quv jarayoni dinamikasi</p></div><select className="rounded-xl border border-[#303a46] bg-[#17202a] px-3 py-2 text-sm outline-none"><option>Oxirgi 7 kun</option><option>Oxirgi 30 kun</option></select></div>
        <div className="h-[310px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={activityData}><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#58cc02" stopOpacity={.35}/><stop offset="100%" stopColor="#58cc02" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#26303a" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" stroke="#768391" tickLine={false} axisLine={false}/><YAxis stroke="#768391" tickLine={false} axisLine={false}/><Tooltip contentStyle={{ background:'#151c24', border:'1px solid #303a46', borderRadius:16 }} /><Area type="monotone" dataKey="faol" stroke="#58cc02" strokeWidth={3} fill="url(#g1)"/><Area type="monotone" dataKey="test" stroke="#1cb0f6" strokeWidth={2} fillOpacity={0}/></AreaChart></ResponsiveContainer></div>
      </Card>
      <Card>
        <h2 className="text-lg font-black">Darajalar taqsimoti</h2><p className="mt-1 text-sm text-[#84919f]">Faol o‘quvchilar kesimida</p>
        <div className="mt-4 h-[230px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={levelData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>{levelData.map((_, i) => <Cell key={i} fill={colors[i]} />)}</Pie><Tooltip contentStyle={{ background:'#151c24', border:'1px solid #303a46', borderRadius:16 }} /></PieChart></ResponsiveContainer></div>
        <div className="grid grid-cols-5 gap-2">{levelData.map((x,i)=><div key={x.name} className="text-center"><span className="mx-auto block h-2.5 w-2.5 rounded-full" style={{background:colors[i]}}/><p className="mt-1 text-xs font-bold text-[#9ba7b4]">{x.name}</p></div>)}</div>
      </Card>
    </section>

    <section className="grid gap-6 xl:grid-cols-3">
      <Card><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-black">Eng faol o‘quvchilar</h2><p className="text-sm text-[#84919f]">XP bo‘yicha haftalik reyting</p></div><Flame className="text-[#ffc800]" /></div><div className="space-y-3">{leaders.map((s,i)=><div key={s.id} className="flex items-center gap-3 rounded-2xl bg-[#121922] p-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#222c37] font-black text-[#ffc800]">{i+1}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{s.name}</p><p className="text-xs text-[#798695]">{s.level} · {s.streak} kunlik streak</p></div><Badge tone="yellow">{s.xp.toLocaleString()} XP</Badge></div>)}</div></Card>
      <Card><h2 className="text-lg font-black">Tekshirilishi kerak</h2><p className="mb-4 text-sm text-[#84919f]">Admin e’tiborini kutayotgan vazifalar</p><div className="space-y-3">{reviewItems.map(({ icon: Icon, title, sub, color }) => <button key={title} className="flex w-full items-center gap-3 rounded-2xl border border-[#27313c] bg-[#121922] p-3 text-left hover:border-[#3b4653]"><div className="rounded-xl p-2.5" style={{background:`${color}18`,color}}><Icon size={20}/></div><div><p className="text-sm font-extrabold">{title}</p><p className="text-xs text-[#7c8997]">{sub}</p></div></button>)}</div></Card>
      <Card><h2 className="text-lg font-black">Tezkor amallar</h2><p className="mb-4 text-sm text-[#84919f]">Ko‘p ishlatiladigan boshqaruvlar</p><div className="grid gap-3">{quickActions.map(({ label, icon: Icon, path }) => <Button key={label} variant="secondary" className="justify-start py-3.5" onClick={()=>nav(path)}><Icon size={19}/>{label}</Button>)}</div></Card>
    </section>
  </div>;
}
