import { LockKeyhole, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { login as apiLogin, ApiError } from '../lib/api';

export function LoginPage() {
  const nav = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return toast.error('Telefon raqam va parolni kiriting');
    setLoading(true);
    try {
      await apiLogin(phone.trim(), password);
      localStorage.setItem('arabosfera-auth', 'true');
      toast.success('Xush kelibsiz!');
      nav('/');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Serverga ulanib bo’lmadi';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  return <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0b1016] p-4">
    <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-[#58cc02]/10 blur-[120px]" /><div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#1cb0f6]/10 blur-[120px]" />
    <div className="panel relative w-full max-w-md rounded-[34px] p-7 sm:p-9">
      <div className="mb-8 text-center"><div className="glow mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-[var(--accent)] text-[#132008]"><Sparkles size={32} /></div><h1 className="mt-5 text-3xl font-black">Arabosfera Admin</h1><p className="mt-2 text-sm text-[#8f9ba8]">Ta’lim platformasini bitta markazdan boshqaring</p></div>
      <form onSubmit={login} className="space-y-4">
        <label className="block"><span className="mb-2 block text-sm font-bold text-[#a7b2bd]">Telefon raqam</span><div className="flex items-center gap-3 rounded-2xl border border-[#313b47] bg-[#111820] px-4 py-3.5 focus-within:border-[#58cc02]"><UserRound size={19} className="text-[#73808e]" /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998901234567" className="w-full bg-transparent outline-none" /></div></label>
        <label className="block"><span className="mb-2 block text-sm font-bold text-[#a7b2bd]">Parol</span><div className="flex items-center gap-3 rounded-2xl border border-[#313b47] bg-[#111820] px-4 py-3.5 focus-within:border-[#58cc02]"><LockKeyhole size={19} className="text-[#73808e]" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent outline-none" /></div></label>
        <Button type="submit" disabled={loading} className="mt-2 w-full py-3.5 text-base"><ShieldCheck size={20} />{loading ? 'Kirilmoqda...' : 'Boshqaruv paneliga kirish'}</Button>
      </form>
      <p className="mt-6 text-center text-xs text-[#667382]">Serverdagi admin telefon raqami va parol bilan kiring.</p>
    </div>
  </div>;
}
