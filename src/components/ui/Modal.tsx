import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export function Modal({ open, title, onClose, children, wide = false }: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <motion.div initial={{ opacity: 0, scale: .96, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} className={`panel custom-scrollbar max-h-[92vh] w-full overflow-y-auto rounded-[28px] ${wide ? 'max-w-5xl' : 'max-w-xl'}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2b3541] bg-[#171e27]/95 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-[#9eabb8] hover:bg-[#27313c] hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}
