# 🏦 FinCore Web Platform — DESIGN.md

---

# 📌 Descripción General

FinCore es una plataforma financiera web construida sobre Oracle REST Data Services (ORDS), diseñada para administrar operaciones bancarias, clientes, cuentas, préstamos, cuotas, transacciones y analítica financiera empresarial mediante una arquitectura modular moderna.

La aplicación será exclusivamente WEB y consumirá APIs REST expuestas por Oracle ORDS.

---

# 🌐 Tipo de Aplicación

## Plataforma

- Aplicación Web SPA (Single Page Application)

## Arquitectura

- Frontend desacoplado
- Backend Oracle ORDS REST API
- Comunicación HTTP/HTTPS JSON

---

# 🎯 Objetivos del Sistema

- Centralizar operaciones financieras
- Gestionar clientes y productos bancarios
- Administrar créditos y cuotas
- Controlar movimientos financieros
- Visualizar indicadores BI
- Proporcionar dashboards ejecutivos
- Tener diseño moderno minimalista

---

# 🧠 Filosofía UX/UI

## Estilo Visual

La plataforma tendrá una apariencia:

- Minimalista
- Profesional
- Moderna
- Elegante
- Financiera corporativa
- Responsive
- Oscura premium

Inspiraciones visuales:

- Stripe
- Revolut
- Linear
- Vercel Dashboard
- Oracle Redwood
- Notion Dark

---

# 🎨 Paleta de Colores

## Dark Theme Principal

| Elemento | Color |
|---|---|
| Background | #0F172A |
| Sidebar | #111827 |
| Cards | #1E293B |
| Primary | #3B82F6 |
| Success | #10B981 |
| Warning | #F59E0B |
| Danger | #EF4444 |
| Text Primary | #F8FAFC |
| Text Secondary | #94A3B8 |
| Border | #334155 |

---

# ✨ Tipografía

## Fuente Principal

- Inter
- Poppins

## Jerarquía

| Elemento | Tamaño |
|---|---|
| Título Principal | 32px |
| Subtítulos | 24px |
| Texto Normal | 14px |
| Labels | 12px |

---

# ⚙️ Stack Tecnológico Web

# Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- ShadCN/UI
- React Query
- Axios
- React Router DOM
- Framer Motion
- ApexCharts

# Backend

- Oracle REST Data Services (ORDS)

# Seguridad

- JWT
- Refresh Tokens
- Session Guards
- Role Permissions

---

# 📁 Arquitectura Frontend

```bash
src/
│
├── api/
├── auth/
├── components/
├── constants/
├── hooks/
├── layouts/
├── modules/
├── pages/
├── routes/
├── services/
├── store/
├── styles/
├── types/
├── utils/
└── widgets/
🧩 Arquitectura Modular

La plataforma se divide en 9 módulos principales.

🛡️ 1. MÓDULO AUTH
Base URL
/auth/
Funcionalidades
Login
POST /auth/login
Logout
POST /auth/logout
Refresh Token
POST /auth/refresh
Usuario Actual
GET /auth/me
UI LOGIN
Características
Pantalla fullscreen
Glassmorphism
Fondo financiero abstracto
Validación reactiva
Recordar sesión
Feedback visual
Componentes
Input email
Input password
Botón acceso
Loader animado
Toast errors
👥 2. MÓDULO CLIENTES
Base URL
/cliente/
CRUD CLIENTES
Crear Cliente
POST /cliente/
Obtener Clientes
GET /cliente/
Obtener Cliente por ID
GET /cliente/{id}
Actualizar Cliente
PUT /cliente/{id}
Eliminar Cliente
DELETE /cliente/{id}
CAMPOS CLIENTE
Campo	Tipo
cedula	string
nombres	string
apellidos	string
telefono	string
correo	string
direccion	string
sucursal_id	number
estado	string
UI CLIENTES
Vista Tabla
DataTable moderna
Paginación
Filtros
Búsqueda dinámica
Exportación Excel/PDF
Estado visual
Vista Formulario
Validaciones
Inputs inteligentes
Confirmaciones
Modal responsive
💳 3. MÓDULO CUENTAS
Base URL
/cuenta/
CRUD CUENTAS
Crear Cuenta
POST /cuenta/
Obtener Cuentas
GET /cuenta/
Obtener Cuenta
GET /cuenta/{id}
Actualizar Cuenta
PUT /cuenta/{id}
Eliminar Cuenta
DELETE /cuenta/{id}
CAMPOS CUENTA
Campo	Tipo
numero_cuenta	string
cliente_id	number
tipo	string
saldo	number
estado	string
UI CUENTAS
Dashboard Financiero

Cards:

Total cuentas
Balance total
Liquidez
Cuentas activas
Tabla
Estado operativo
Balance visual
Colores dinámicos
💰 4. MÓDULO PRÉSTAMOS
Base URL
/prestamo/
CRUD PRÉSTAMOS
Crear Préstamo
POST /prestamo/
Obtener Préstamos
GET /prestamo/
Obtener Préstamo
GET /prestamo/{id}
Actualizar Préstamo
PUT /prestamo/{id}
Eliminar Préstamo
DELETE /prestamo/{id}
CAMPOS PRÉSTAMO
Campo	Tipo
cliente_id	number
monto	number
tasa_interes	number
plazo	number
estado	string
UI PRÉSTAMOS
Vista Ejecutiva
Riesgo
Capital colocado
Estado
Mora potencial
Formularios
Simulación financiera
Cálculo automático
Tasa dinámica
📅 5. MÓDULO CUOTAS
Base URL
/cuotas/
CRUD CUOTAS
Crear Cuota
POST /cuotas/
Obtener Cuotas
GET /cuotas/
Obtener Cuota
GET /cuotas/{id}
Actualizar Cuota
PUT /cuotas/{id}
Eliminar Cuota
DELETE /cuotas/{id}
UI CUOTAS
Timeline Financiero

Estados:

Pagada
Pendiente
Vencida
Mora
Componentes
Calendario
Timeline
Badge status
Indicador mora
🔄 6. MÓDULO TRANSACCIONES
Base URL
/transacciones/
ENDPOINTS
Depósito
POST /transacciones/deposito
Retiro
POST /transacciones/retiro
Transferencia
POST /transacciones/transferencia
Historial
GET /transacciones/
UI TRANSACCIONES
Ledger Financiero
Timeline movimientos
Estados
Filtros
Búsqueda
Exportación
Visual
Verde → ingreso
Rojo → egreso
Azul → transferencia
🏦 7. MÓDULO BANCO
Base URL
/banco/
ENDPOINTS
Historial Cuenta
GET /banco/cuentas/{id}/transacciones
Registrar Movimiento
POST /banco/cuentas/{id}/transacciones
UI BANCO
Navegación Jerárquica

Cuenta →
Movimientos →
Detalle →
Auditoría

🧠 8. MÓDULO FINCORE CENTRAL
Base URL
/fincore/
ENDPOINTS
Movimientos Centralizados
POST /fincore/movimientos
Reversos
POST /fincore/reversos
Auditoría
GET /fincore/auditoria
UI OPERACIONAL
Consola Central
Logs
Eventos
Trazabilidad
Auditoría
Reversiones
📊 9. MÓDULO REPORTES BI
Base URL
/reportes/
ENDPOINTS
Liquidez
GET /reportes/liquidez
Morosidad
GET /reportes/morosidad
Riesgo Crediticio
GET /reportes/riesgo
Ranking Cartera
GET /reportes/ranking
📈 DASHBOARD EJECUTIVO
KPIs PRINCIPALES
Clientes registrados
Capital colocado
Liquidez global
Total préstamos
Mora promedio
Transacciones del día
Balance financiero
Flujo mensual
📉 GRÁFICOS
Charts
Line Charts
Area Charts
Donut Charts
Bar Charts
Heatmaps
KPI Cards
🖥️ LAYOUT GENERAL
Sidebar
Elementos
Dashboard
Clientes
Cuentas
Préstamos
Cuotas
Transacciones
Banco
Reportes
Configuración
Navbar Superior
Componentes
Buscador
Usuario
Notificaciones
Configuración
Dark mode
📱 RESPONSIVE DESIGN
Compatibilidad
Desktop
Tablet
Mobile
⚡ PERFORMANCE
Estrategias
Lazy Loading
React Query Cache
Code Splitting
Memoización
Virtual Tables
🔐 SEGURIDAD
Implementaciones
JWT
Refresh Tokens
Rate Limiting
Roles
Permisos
Auditoría
Logs
📂 ESTRUCTURA DE PÁGINAS
/pages
│
├── dashboard
├── auth
├── clientes
├── cuentas
├── prestamos
├── cuotas
├── transacciones
├── banco
├── reportes
└── configuracion
🧩 COMPONENTES REUTILIZABLES
Shared Components
TableGeneric
ModalForm
ConfirmDialog
KPIWidget
ChartCard
SearchBar
FiltersPanel
StatusBadge
LoadingSkeleton
🔥 FUNCIONALIDADES PREMIUM
Futuras
WebSockets
Notificaciones realtime
Exportación PDF
Exportación Excel
IA financiera
Riesgo predictivo
Detección de fraude
🚀 ROADMAP
FASE 1
Login
CRUDs
Dashboard
Seguridad
FASE 2
BI avanzado
Reportes
Auditoría
FASE 3
Inteligencia Artificial
Machine Learning
Predicción financiera
🏁 RESULTADO FINAL

Una plataforma bancaria web moderna, escalable y profesional con:

Diseño minimalista premium
CRUD completo
Dashboard ejecutivo
BI financiero
Seguridad empresarial
Integración Oracle ORDS
Arquitectura modular
Experiencia SaaS bancaria moderna