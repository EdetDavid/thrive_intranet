import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import LeavePage from './pages/LeavePage';
import HRDashboard from './pages/HRDashboard';
import MyTeam from './pages/MyTeam';
import SubmitLeavePage from './pages/SubmitLeavePage';
import ErrorBoundary from './components/ErrorBoundary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'login', element: <LoginPage /> },
  { path: 'admin', element: <AdminPanel /> },
  { path: 'leaves', element: <LeavePage /> },
  { path: 'submit-leave', element: <SubmitLeavePage /> },
  { path: 'hr', element: <HRDashboard /> },
  { path: 'my-team', element: <MyTeam /> },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);