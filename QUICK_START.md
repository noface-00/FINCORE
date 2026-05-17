# 🚀 Guía Rápida - FinCore Platform

## Inicio Rápido (3 minutos)

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Ejecutar Modo Desarrollo
```bash
npm run dev
```
Abre: **http://localhost:5174**

### 3. Build para Producción
```bash
npm run build
npm run preview
```

---

## 📱 Navegación

| Página | Ruta | Descripción |
|--------|------|-------------|
| 🎯 Dashboard | `/` | KPIs ejecutivos + 4 gráficos |
| 👥 Clientes | `/clientes` | CRUD con búsqueda |
| 💳 Cuentas | `/cuentas` | Dashboard financiero |
| 💰 Préstamos | `/prestamos` | Vista ejecutiva + riesgo |
| 📅 Cuotas | `/cuotas` | Timeline de pagos |
| 🔄 Transacciones | `/transacciones` | Ledger con colores |
| 📊 Reportes | `/reportes` | BI con 4 reportes |
| 🏦 Banco | `/banco` | Operaciones centralizadas |
| ⚙️ Config | `/config` | Configuración (WIP) |

---

## 🎨 Personalización

### Cambiar Colores
Edita `/src/index.css` (CSS variables):
```css
:root {
  --primary: #3B82F6;      /* Azul */
  --success: #10B981;      /* Verde */
  --danger: #EF4444;       /* Rojo */
  --warning: #F59E0B;      /* Naranja */
}
```

### Cambiar Logo
Edita `/src/layouts/Sidebar.tsx`:
```tsx
<h1 className="text-2xl font-bold">Tu Logo Aquí</h1>
```

### Mock Data → API Real
1. Reemplaza `mockClientes[]` con `fetch()`
2. Usa `useEffect()` para cargar datos
3. Cambia `useState()` por estado del servidor

---

## 📦 Estructura de Componentes

### Página Simple
```tsx
export function MiPaginaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Título</h1>
      {/* Contenido */}
    </div>
  );
}
```

### Con Tabla
```tsx
import { DataTable } from '../../components/shared/DataTable';

const columns = [
  { key: 'nombre' as const, header: 'Nombre' },
  { key: 'email' as const, header: 'Email' },
];

<DataTable columns={columns} data={datos} />
```

### Con Modal
```tsx
import { Modal } from '../../components/shared/Modal';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  title="Mi Modal"
  onClose={() => setIsOpen(false)}
  actions={
    <>
      <button onClick={() => setIsOpen(false)}>Cancelar</button>
      <button>Guardar</button>
    </>
  }
>
  {/* Formulario aquí */}
</Modal>
```

### Con Gráficos
```tsx
import { LineChartComponent, BarChartComponent } from '../../components/charts/Charts';

const data = [
  { name: 'Ene', value: 100 },
  { name: 'Feb', value: 120 },
];

<LineChartComponent title="Mis Datos" data={data} />
<BarChartComponent title="Gráfico de Barras" data={data} />
```

### Con KPI
```tsx
import { KPIWidget } from '../../components/widgets/KPIWidget';
import { Users } from 'lucide-react';

<KPIWidget
  label="Clientes"
  value="1,250"
  icon={<Users size={24} />}
  color="primary"
  change={{ value: 8, isPositive: true }}
/>
```

---

## 🔌 Conectar a Oracle ORDS

### 1. Crear Servicio API
```typescript
// src/api/clientes.ts
import axios from 'axios';

const API_BASE = 'https://tu-oracle.com/api';

export async function getClientes() {
  const response = await axios.get(`${API_BASE}/cliente/`);
  return response.data;
}

export async function createCliente(cliente: Cliente) {
  const response = await axios.post(`${API_BASE}/cliente/`, cliente);
  return response.data;
}
```

### 2. Usar en Componentes
```typescript
import { getClientes } from '../../api/clientes';

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    getClientes()
      .then(data => setClientes(data))
      .catch(error => console.error(error));
  }, []);

  // Resto del componente...
}
```

### 3. Agregar Autenticación JWT
```typescript
// src/api/config.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tu-oracle.com/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 🧪 Testing

### Linter
```bash
npm run lint
```

### Build Test
```bash
npm run build
```

---

## 📚 Recursos Útiles

- **React**: https://react.dev
- **TailwindCSS**: https://tailwindcss.com
- **Recharts**: https://recharts.org
- **Lucide Icons**: https://lucide.dev
- **TypeScript**: https://www.typescriptlang.org
- **Vite**: https://vitejs.dev

---

## 🐛 Troubleshooting

### Port 5174 en uso
```bash
# Encuentra y mata el proceso
lsof -i :5174
kill -9 <PID>
```

### Módulos faltantes
```bash
npm install
```

### TypeScript errors
```bash
npm run build
```

---

## 📝 Notas

- ✅ Toda la estructura está lista para Oracle ORDS
- ✅ Mock data permite desarrollo sin backend
- ✅ Componentes reutilizables para agregar más módulos
- ✅ Responsive design en Desktop, Tablet, Mobile
- ✅ Dark theme premium implementado
- ✅ Listo para CI/CD (build ejecuta sin errores)

---

**¡Listo para customizar y desplegar!** 🚀
