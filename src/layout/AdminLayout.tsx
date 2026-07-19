import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-[#0d1117] text-white">
    <Sidebar open={open} setOpen={setOpen} />
    <div className="lg:pl-[286px]">
      <Topbar onMenu={() => setOpen(true)} />
      <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  </div>;
}
