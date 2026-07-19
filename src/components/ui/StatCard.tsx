import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Card } from './Card';

export function StatCard({ title, value, change, icon: Icon, accent = '#58cc02' }: { title: string; value: string; change: string; icon: LucideIcon; accent?: string }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-10 blur-2xl" style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#8f9ba8]">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
        </div>
        <div className="rounded-2xl p-3" style={{ color: accent, background: `${accent}18` }}><Icon size={22} /></div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#79d851]"><ArrowUpRight size={14} />{change}</div>
    </Card>
  );
}
