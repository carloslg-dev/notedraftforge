import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkListPage } from '@/ui/features/work-list/WorkListPage';
import { WorkViewPage } from '@/ui/features/work-view/WorkViewPage';
import { Toaster } from '@/ui/components/ui/toaster';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkListPage />} />
        <Route path="/work/:pieceId" element={<WorkViewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
