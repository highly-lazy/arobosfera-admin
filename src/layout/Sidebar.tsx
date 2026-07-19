import { BarChart3, Bell, BookOpen, ChevronDown, CircleGauge, FileText, Headphones, HelpCircle, LayoutDashboard, LogOut, Medal, Menu, MessageSquareText, Settings, ShieldCheck, Sparkles, Swords, Tags, Users, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/cn';
import { logout } from '../lib/api';

const groups = [
  { label: 'Asosiy', items: [
    { to: '/', label: 'Boshqaruv paneli', icon: LayoutDashboard },
    { to: '/foydalanuvchilar', label: 'Foydalanuvchilar', icon: Users },
    { to: '/imtihonlar', label: 'Imtihon natijalari', icon: Medal },
    { to: '/analitika', label: 'Analitika', icon: BarChart3 },
  ]},
  { label: 'Ta’lim kontenti', items: [
    { to: '/testlar', label: 'Testlar menejeri', icon: BookOpen },
    { to: '/docx-import', label: 'DOCX import', icon: FileText },
    { to: '/audio', label: 'Audio fayllar', icon: Headphones },
  ]},
  { label: 'Faollik', items: [
    { to: '/oktagon', label: 'Oktagon monitoring', icon: Swords },
    { to: '/bildirishnomalar', label: 'Bildirishnomalar', icon: Bell },
    { to: '/promo-kodlar', label: 'Promo-kodlar', icon: Tags },
  ]},
  { label: 'Tizim', items: [
    { to: '/murojaatlar', label: 'Murojaatlar', icon: HelpCircle },
    { to: '/loglar', label: 'Tizim loglari', icon: CircleGauge },
    { to: '/kengaytirilgan', label: 'Kengaytirilgan', icon: ShieldCheck },
    { to: '/sozlamalar', label: 'Sozlamalar', icon: Settings },
  ]},
];

export function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  return (
    <>
      {open && <button aria-label="Menyuni yopish" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-[286px] flex-col border-r border-[#252e38] bg-[#10161d] transition-transform duration-300 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-20 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="glow grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent)] text-[#112008]"><Sparkles size={24} strokeWidth={2.8} /></div>
            <div><p className="text-lg font-black tracking-tight">Arabosfera</p><p className="text-xs font-bold text-[#758291]">ADMIN MARKAZI</p></div>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-xl p-2 text-[#8996a4] hover:bg-[#222c36] lg:hidden"><X size={20} /></button>
        </div>

        <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 pb-5">
          {groups.map((group) => {
            const collapsed = collapsedGroups.includes(group.label);
            return <div key={group.label} className="mt-4">
              <button onClick={() => setCollapsedGroups((p) => collapsed ? p.filter((x) => x !== group.label) : [...p, group.label])} className="mb-2 flex w-full items-center justify-between px-3 text-[11px] font-black uppercase tracking-[.16em] text-[#647180]">
                {group.label}<ChevronDown size={14} className={cn('transition', collapsed && '-rotate-90')} />
              </button>
              {!collapsed && <div className="space-y-1">
                {group.items.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={({ isActive }) => cn('flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition', isActive ? 'bg-[var(--accent)] text-[#132008] shadow-[0_4px_0_var(--accent-dark)]' : 'text-[#9aa7b5] hover:bg-[#1b232c] hover:text-white')}>
                  <item.icon size={20} />{item.label}
                </NavLink>)}
              </div>}
            </div>;
          })}
        </nav>

        <div className="border-t border-[#252e38] p-3">
          <div className="mb-3 rounded-2xl bg-[#17202a] p-3">
            <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1cb0f6] font-black">AD</div><div className="min-w-0"><p className="truncate text-sm font-extrabold">Abror Admin</p><p className="truncate text-xs text-[#7f8b98]">Bosh administrator</p></div></div>
          </div>
          <button onClick={async () => { await logout(); localStorage.removeItem('arabosfera-auth'); location.href = '/kirish'; }} className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-[#ff7777] hover:bg-[#ff4b4b]/10"><LogOut size={19} />Tizimdan chiqish</button>
        </div>
      </aside>
      <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-20 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent)] text-[#122008] shadow-2xl lg:hidden"><Menu /></button>
    </>
  );
}
