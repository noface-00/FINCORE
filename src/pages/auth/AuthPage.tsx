// src/pages/auth/AuthPage.tsx
import React, { useState } from 'react';
import { Shield, Mail, Lock, User as UserIcon, Phone, MapPin, Key, Landmark } from 'lucide-react';
import { login } from '../../api/auth.api';

interface AuthPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Register fields
  const [name, setName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Clear any stale tokens before attempting login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        try {
          const res = await login(email, password);
          onLoginSuccess(res.data.access_token, res.data.user);
        } catch (apiErr: any) {
          const status = apiErr?.response?.status;

          // 401 = ORDS running but credentials not found in its DB
          // Other errors = ORDS unreachable (network, CORS, etc.)
          if (status === 401) {
            throw new Error(
              'Credenciales incorrectas. Verifique su correo y contraseña en el sistema ORDS.'
            );
          }

          // ORDS unreachable → use client-side fallback for dev/demo
          // Token MUST be Base64-encoded in the format ORDS expects: "sub=ID,rol=ROL"
          // ORDS PL/SQL runs UTL_ENCODE.BASE64_DECODE on it, plain strings cause exception 555
          console.warn('[FinCore] ORDS no disponible, usando modo demo local:', apiErr?.message);
          if (email.includes('@') && password.length >= 4) {
            const fakeUser = {
              empleado_id: 1,
              nombre: email.split('@')[0],
              apellido: 'Demo',
              email,
              rol: 'ADMIN',
              sucursal_id: 1,
            };
            // Generate ORDS-compatible Base64 token: btoa("sub=1,rol=ADMIN")
            const demoToken = btoa('sub=1,rol=ADMIN');
            onLoginSuccess(demoToken, fakeUser);
          } else {
            throw new Error('Correo o contraseña demasiado cortos para el modo demo.');
          }
        }
      } else {
        // Register flow (demo)
        await new Promise(r => setTimeout(r, 1000));
        const fakeUser = {
          empleado_id: Date.now(),
          nombre: name.split(' ')[0] || 'Usuario',
          apellido: name.split(' ').slice(1).join(' ') || 'Nuevo',
          email,
          rol: 'CAJERO',
          sucursal_id: 1,
        };
        // Same ORDS-compatible Base64 format for register demo mode
        const demoToken = btoa('sub=1,rol=CAJERO');
        onLoginSuccess(demoToken, fakeUser);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error en la autenticación');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background futuristic grids & blur effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#3B82F6]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-lg bg-[#1E293B]/60 backdrop-blur-xl border border-[#334155]/60 rounded-2xl shadow-2xl overflow-hidden p-8 z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#3B82F6]/20 border border-[#3B82F6]/40 rounded-xl mb-4 text-[#3B82F6] animate-pulse">
            <Landmark size={30} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
            FIN<span className="text-[#3B82F6]">CORE</span>
          </h1>
          <p className="text-[#94A3B8] mt-2 text-sm">
            Core Bancario de Alta Frecuencia & Conectividad ORDS
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#0F172A] p-1 rounded-lg border border-[#334155] mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              isLogin 
                ? 'bg-[#3B82F6] text-white shadow-md' 
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              !isLogin 
                ? 'bg-[#3B82F6] text-white shadow-md' 
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Nombre Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-[#64748B]" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Identificación / Cédula</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 text-[#64748B]" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Cédula"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-[#64748B]" size={18} />
                    <input
                      type="tel"
                      required
                      placeholder="Celular"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Dirección</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-[#64748B]" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Dirección fiscal"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-[#64748B]" size={18} />
              <input
                type="email"
                required
                placeholder="usuario@fincore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[#64748B]" size={18} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-[#64748B]" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all"
                />
              </div>
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <a href="#reset" className="text-xs text-[#3B82F6] hover:underline transition-all">
                ¿Olvidó su contraseña?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#3B82F6]/50 text-white rounded-lg font-semibold shadow-lg shadow-[#3B82F6]/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Shield size={18} />
                {isLogin ? 'Ingresar a FinCore' : 'Crear Cuenta Financiera'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
