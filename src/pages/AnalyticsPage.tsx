import { BarChart3, Download, Loader2, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useDashboard } from '../hooks/useDashboard';
import { toast } from 'sonner';

const colors = ['#58cc02', '#1cb0f6', '#ffc800', '#ce82ff', '#ff4b4b'];

export function AnalyticsPage() {
  const { data, loading, error, reload } = useDashboard();
  const activityData = (data?.weeklyActivity ?? []).map((w) => ({ name: w.label, faol: w.activeUsers, test: w.testSessions }));
  const levelData = (data?.levelDistribution ?? []).map((l) => ({ name: l.code, value: l.count }));
  const hasLevels = levelData.some((l) => l.value > 0);

  if (loading) return <div className="flex flex-col items-center py-32 text-[#768391]"><Loader2 className="animate-spin" /><p className="mt-3 text-sm">Yuklanmoqda...</p></div>;
  if (error || !data) return <div className="flex flex-col items-center py-32"><p className="text-sm text-[#ff7777]">{error ?? 'Ma’lumot yo’q'}</p><button onClick={reload} className="mt-3 rounded-xl bg-[#27313d] px-4 py-2 text-sm font-bold">Qayta urinish</button></div>;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Platforma ko‘rsatkichlari</h2><p className="text-sm text-[#7f8c99]">Faollik, natijalar va daraja taqsimoti tahlili</p></div><Button onClick={() => toast.success('Hisobot yuklashga tayyorlandi')}><Download size={18} />PDF hisobot</Button></div>
    <div className="grid gap-6 xl:grid-cols-2">
      <Card><h3 className="flex items-center gap-2 font-black"><TrendingUp className="text-[#58cc02]" />Haftalik faollik</h3><div className="mt-5 h-[320px]"><ResponsiveContainer><BarChart data={activityData}><CartesianGrid stroke="#26303a" vertical={false} /><XAxis dataKey="name" stroke="#768391" axisLine={false} tickLine={false} /><YAxis stroke="#768391" axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: '#151c24', border: '1px solid #303a46', borderRadius: 16 }} /><Bar dataKey="faol" name="Faol foydalanuvchi" fill="#58cc02" radius={[8, 8, 0, 0]} /><Bar dataKey="test" name="Test sessiyalari" fill="#1cb0f6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
      <Card><h3 className="flex items-center gap-2 font-black"><BarChart3 className="text-[#1cb0f6]" />Darajalar bo‘yicha taqsimot</h3>{hasLevels ? <div className="mt-5 h-[320px]"><ResponsiveContainer><PieChart><Pie data={levelData} dataKey="value" nameKey="name" outerRadius={110} label>{levelData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip contentStyle={{ background: '#151c24', border: '1px solid #303a46', borderRadius: 16 }} /></PieChart></ResponsiveContainer></div> : <div className="mt-5 flex h-[320px] flex-col items-center justify-center text-center text-[#768391]"><BarChart3 size={40} className="opacity-40" /><p className="mt-3 text-sm">Hali darajaga ega o‘quvchi yo‘q</p></div>}</Card>
    </div>
    <Card><h3 className="font-black">Eng ko‘p xato qilinayotgan mavzular</h3><div className="mt-5 flex flex-col items-center justify-center py-10 text-center text-[#768391]"><TrendingUp size={38} className="opacity-40" /><p className="mt-3 text-sm">Bu tahlil test yechilgani sari to‘planadi</p><p className="text-xs text-[#5f6b78]">Hozircha yetarli test sessiyasi yo‘q</p></div></Card>
  </div>;
}
