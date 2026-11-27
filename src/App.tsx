import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import MyComplaints from './pages/MyComplaints';
import ReportIssue from './pages/ReportIssue';
import TrackComplaint from './pages/TrackComplaint';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route
          path="report"
          element={
            <RequireAuth>
              <ReportIssue />
            </RequireAuth>
          }
        />
        <Route
          path="track"
          element={
            <RequireAuth>
              <TrackComplaint />
            </RequireAuth>
          }
        />
        <Route
          path="track/:id"
          element={
            <RequireAuth>
              <TrackComplaint />
            </RequireAuth>
          }
        />
        <Route
          path="my-complaints"
          element={
            <RequireAuth>
              <MyComplaints />
            </RequireAuth>
          }
        />
        <Route
          path="admin"
          element={
            <RequireAuth adminOnly>
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
