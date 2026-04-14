import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './components/MainLayout';

/** 旧链接 #/welcome → #/hello */
function RedirectWelcomeToHello() {
  const location = useLocation();
  const to = `${location.pathname.replace(/^\/welcome/, '/hello')}${location.search}`;
  return <Navigate to={to} replace />;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/hello" replace />} />
        <Route path="/welcome/*" element={<RedirectWelcomeToHello />} />
        <Route path="*" element={<MainLayout />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
