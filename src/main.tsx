import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

const savedAccent = localStorage.getItem('arabosfera-accent');
if (savedAccent) {
  try { const [a,d]=JSON.parse(savedAccent); document.documentElement.style.setProperty('--accent',a); document.documentElement.style.setProperty('--accent-dark',d); } catch {}
}

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><App/><Toaster theme="dark" richColors position="top-right"/></BrowserRouter></StrictMode>);
