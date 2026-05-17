# FinCore — Sistema Bancario de Administración

> **Dashboard administrativo** para cooperativas financieras, conectado a Oracle ORDS como backend REST.  
> Stack: React 18 + TypeScript + Vite + Tailwind CSS + Oracle ORDS (PL/SQL)

---

## 📋 Estado del Proyecto

### ✅ Funcionando correctamente

| Módulo | Descripción |
|--------|-------------|
| **Autenticación** | Login contra Oracle ORDS. Si ORDS no está disponible o devuelve 401, activa automáticamente el **Modo Demo** para desarrollo |
| **Modo Demo** | Datos mock en memoria, CRUDs completos sin depender del servidor. Token Base64 compatible con ORDS |
| **Clientes** | Listar, crear, editar y eliminar clientes. Lectura desde ORDS + fallback a datos mock |
| **Cuentas** | Listar 25 cuentas desde ORDS (`/cuenta/listar`). Crear, editar y eliminar con fallback local |
| **Préstamos** | Listar por cliente, crear solicitud, aprobar / rechazar / liquidar préstamos |
| **Cuotas** | Listar cuotas de un préstamo, crear, actualizar estado (Pendiente / Pagada / Vencida / Mora) |
| **Transacciones** | Depósito, retiro, transferencia. Listado con rango de fechas dinámico (últimos 90 días) |
| **Dashboard / KPIs** | Widgets con métricas en tiempo real (saldo total, clientes activos, tasa morosidad) |
| **Reportes** | Módulo conectado: morosidad, saldos por tipo, ranking clientes, captaciones vs colocaciones |
| **DataTable** | Tabla genérica con loading states, empty states, keys React únicos |
| **Sidebar / Layout** | Navegación con glassmorphism, estado activo, logout |
| **Proxy Vite (dev)** | Elimina CORS en desarrollo: todas las peticiones `/ords/*` se proxean al servidor Oracle |

### ⚠️ Limitaciones conocidas / Pendiente

| Problema | Causa | Solución recomendada |
|----------|-------|----------------------|
| **Login ORDS devuelve 401** | Las credenciales del empleado no están en la BD de producción del servidor ORDS | Registrar el usuario directamente en Oracle (`INSERT INTO empleados`) |
| **ORDS `PUT /cliente/actualizar` devuelve 555** | El handler PL/SQL valida el `access_token` contra la sesión activa en Oracle; el token demo no existe en BD | Autenticarse con credenciales reales de ORDS |
| **`/transacciones/listar` devuelve 0 filas** | El endpoint ORDS requiere `fecha_inicio` / `fecha_fin` válidos y datos en BD | Ya se envía rango de 90 días. Verificar datos en Oracle |
| **PUT bloqueado por CORS en producción** | El servidor ORDS no tiene `PUT` en `Access-Control-Allow-Methods` | Agregar encabezado en ORDS o usar reverse proxy (Nginx/Apache) |
| **Estado management básico** | Se usa `useState/useEffect` sin caché entre navegaciones | Migrar a TanStack Query (React Query) |
| **Autenticación JWT real** | Actualmente usa Base64 simple (`sub=1,rol=ADMIN`), no JWT firmado | Implementar JWT firmado en el middleware PL/SQL de ORDS |
| **Módulo Configuración** | No implementado aún | Siguiente paso del roadmap |

---

## 🚀 Instalación y Desarrollo

### Requisitos

- Node.js ≥ 18
- npm ≥ 9
- Acceso a Oracle ORDS (o usar Modo Demo sin servidor)

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/fincore.git
cd fincore
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno (opcional)

Crea un archivo `.env.local` en la raíz si necesitas apuntar a un servidor ORDS diferente:

```env
# URL base del servidor Oracle ORDS
# En desarrollo, si no se define, Vite hace proxy automático a http://100.100.129.101:8080
VITE_ORDS_BASE_URL=http://TU_SERVIDOR:8080
```

> **Nota:** Si no defines esta variable, el proxy de Vite redirige automáticamente  
> todas las peticiones `/ords/*` al servidor configurado en `vite.config.ts`.

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

La app abre en `http://localhost:5173`

### 5. Credenciales

| Modo | Email | Contraseña |
|------|-------|-----------|
| **ORDS real** | Credenciales del empleado registrado en Oracle | (definidas en BD) |
| **Demo local** | `admin@fincore.com` | `admin1234` (cualquier email válido + ≥4 caracteres) |

---

## 🏗️ Arquitectura

```
src/
├── api/                      # Clientes HTTP (axios)
│   ├── axios.ts              # Instancia axios + interceptors + auto-proxy dev
│   ├── auth.api.ts           # Login / logout (cliente aislado, sin interceptors)
│   ├── clientes.api.ts       # CRUD clientes + isDemoMode() guard
│   ├── cuentas.api.ts        # CRUD cuentas + multi-shape ORDS parser
│   ├── prestamos.api.ts      # CRUD préstamos
│   ├── cuotas.api.ts         # CRUD cuotas
│   └── transacciones.api.ts  # Depósito / Retiro / Transferencia
├── components/
│   ├── shared/
│   │   ├── DataTable.tsx     # Tabla genérica con keys React únicos
│   │   ├── Modal.tsx         # Modal glassmorphism con animaciones
│   │   └── StatusBadge.tsx   # Badges de estado automáticos
│   └── widgets/
│       └── KPIWidget.tsx     # Cards de métricas con hover effects
├── hooks/                    # useClients, useAccounts
├── layouts/                  # Sidebar + MainLayout
├── pages/                    # Clientes, Cuentas, Préstamos, Cuotas, Transacciones, Reportes
└── types/                    # Interfaces TypeScript globales
```

### Patrón de resiliencia `isDemoMode()`

Todos los endpoints de escritura verifican si el token es un token demo:

```
Token válido ORDS → Llama a ORDS → Si falla → Aplica localmente
Token demo       → Salta ORDS   → Aplica directamente en memoria
```

### Proxy Vite en desarrollo (elimina CORS)

```
Browser → localhost:5173/ords/fincore/...
       → Vite proxy (server-to-server, sin CORS)
       → http://100.100.129.101:8080/ords/fincore/...
```

---

## 🛠️ Scripts

```bash
npm run dev      # Servidor de desarrollo con hot reload + proxy ORDS
npm run build    # Build de producción (TypeScript strict)
npm run preview  # Preview del build de producción
```

---

## 📦 Stack Tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 18 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool + dev server proxy |
| Tailwind CSS | 3.x | Utility CSS |
| Axios | 1.x | HTTP client |
| React Router | 6.x | Navegación SPA |
| Lucide React | latest | Iconografía |
| Recharts | 2.x | Gráficos BI |
| Oracle ORDS | 23.x | Backend REST + PL/SQL |

---

## 📡 Endpoints ORDS Configurados

| Módulo | Método | Endpoint |
|--------|--------|----------|
| Auth | POST | `/auth/login` |
| Clientes | GET | `/cliente/listar` |
| Clientes | POST | `/cliente/crear` |
| Clientes | PUT | `/cliente/actualizar/:id` |
| Clientes | DELETE | `/cliente/eliminar/:id` |
| Cuentas | GET | `/cuenta/listar` |
| Cuentas | POST | `/cuenta/crear` |
| Cuentas | PUT | `/cuenta/actualizar/:id` |
| Transacciones | POST | `/transacciones/listar` |
| Transacciones | POST | `/transacciones/deposito` |
| Préstamos | GET | `/prestamo/cliente/:id` |
| Préstamos | POST | `/prestamo/crear` |
| Préstamos | PUT | `/prestamo/actualizar/:id` |
| Cuotas | GET | `/cuotas/listar/:prestamo_id` |
| Cuotas | POST | `/cuotas/crear` |
| Cuotas | PUT | `/cuotas/actualizar/:id` |
| Reportes | GET | `/reportes/morosidad` |
| Reportes | GET | `/reportes/saldos-por-tipo` |
| Reportes | GET | `/reportes/ranking-clientes` |

---

## 👤 Autor

Desarrollado con Oracle ORDS + React para gestión bancaria cooperativa.
