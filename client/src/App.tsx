import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Problems } from './pages/Problems';
import { Categories } from './pages/Categories';
import { Tags } from './pages/Tags';
import { Notes } from './pages/Notes';
import { Review } from './pages/Review';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/review" element={<Review />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
