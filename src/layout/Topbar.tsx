import { Bell, CalendarDays, Menu, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/': 'Boshqaruv paneli', '/foydalanuvchilar': 'Foydalanuvchilar nazorati', '/imtihonlar': 'Imtihon natijalari va baholash', '/analitika': 'Ko‘p darajali analitika', '/testlar': 'Kontent va testlar menejeri', '/docx-import': 'Aqlli DOCX test parser', '/oktagon': 'Oktagon jonli monitoring', '/bildirishnomalar': 'Bildirishnomalar yuborish', '/promo-kodlar': 'Promo-kodlar va obunalar', '/murojaatlar': 'Qo‘llab-quvvatlash', '/loglar': 'Tizim loglari', '/kengaytirilgan': 'Kengaytirilgan boshqaruv', '/sozlamalar': 'Tizim sozlamalari', '/audio': 'Audio fayllar ombori'
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation();
  return <header className="sticky top-0 z-20 border-b border-[#252f3a] bg-[#0d1117]/88 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
    <div className="flex items-center gap-4">
      <button onClick={onMenu} className="rounded-xl p-2 hover:bg-[#202934] lg:hidden"><Menu size={22} /></button>
      <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#697685]">Arabosfera boshqaruvi</p><h1 className="truncate text-xl font-black sm:text-2xl">{titles[pathname] ?? 'Admin panel'}</h1></div>
      <div className="hidden min-w-[270px] items-center gap-2 rounded-2xl border border-[#293440] bg-[#151c24] px-3 py-2.5 md:flex"><Search size={18} className="text-[#728090]" /><input className="w-full bg-transparent text-sm outline-none placeholder:text-[#657281]" placeholder="Qidirish..." /></div>
      <button className="hidden items-center gap-2 rounded-2xl border border-[#2b3541] bg-[#171e27] px-3 py-2.5 text-sm font-bold text-[#aab6c2] sm:flex"><CalendarDays size={18} />18-iyul</button>
      <button className="relative rounded-2xl border border-[#2b3541] bg-[#171e27] p-3 text-[#b3bfca] hover:text-white"><Bell size={20} /><span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#171e27] bg-[#ff4b4b]" /></button>
    </div>
  </header>;
}
