import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layout/AdminLayout';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdvancedPage } from './pages/AdvancedPage';
import { AudioPage } from './pages/AudioPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocxParserPage } from './pages/DocxParserPage';
import { ExamsPage } from './pages/ExamsPage';
import { LoginPage } from './pages/LoginPage';
import { LogsPage } from './pages/LogsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { OktagonPage } from './pages/OktagonPage';
import { PromoCodesPage } from './pages/PromoCodesPage';
import { SettingsPage } from './pages/SettingsPage';
import { SupportPage } from './pages/SupportPage';
import { TestsPage } from './pages/TestsPage';
import { UsersPage } from './pages/UsersPage';

function Protected(){return localStorage.getItem('arabosfera-auth')==='true'?<AdminLayout/>:<Navigate to="/kirish" replace/>}
export default function App(){return <Routes><Route path="/kirish" element={<LoginPage/>}/><Route element={<Protected/>}><Route index element={<DashboardPage/>}/><Route path="foydalanuvchilar" element={<UsersPage/>}/><Route path="imtihonlar" element={<ExamsPage/>}/><Route path="analitika" element={<AnalyticsPage/>}/><Route path="testlar" element={<TestsPage/>}/><Route path="docx-import" element={<DocxParserPage/>}/><Route path="audio" element={<AudioPage/>}/><Route path="oktagon" element={<OktagonPage/>}/><Route path="bildirishnomalar" element={<NotificationsPage/>}/><Route path="promo-kodlar" element={<PromoCodesPage/>}/><Route path="murojaatlar" element={<SupportPage/>}/><Route path="loglar" element={<LogsPage/>}/><Route path="kengaytirilgan" element={<AdvancedPage/>}/><Route path="sozlamalar" element={<SettingsPage/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
