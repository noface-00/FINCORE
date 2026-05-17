import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/dashboard/Dashboard';
import { ClientesPage } from './pages/clientes/Clientes';
import { CuentasPage } from './pages/cuentas/Cuentas';
import { PrestamosPage } from './pages/prestamos/Prestamos';
import { CuotasPage } from './pages/cuotas/Cuotas';
import { TransaccionesPage } from './pages/transacciones/Transacciones';
import { ReportesPage } from './pages/reportes/Reportes';
import { BancoPage } from './pages/banco/Banco';
import { ConfigPage } from './pages/config/Config';
import { AuthPage } from './pages/auth/AuthPage';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));

  const handleLoginSuccess = (newToken: string, user: any) => {
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setToken(null);
  };

  if (!token) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <BrowserRouter>
      <MainLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/cuentas" element={<CuentasPage />} />
          <Route path="/prestamos" element={<PrestamosPage />} />
          <Route path="/cuotas" element={<CuotasPage />} />
          <Route path="/transacciones" element={<TransaccionesPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/banco" element={<BancoPage />} />
          <Route path="/config" element={<ConfigPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
