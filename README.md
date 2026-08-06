# 💰 Aplicación de Finanzas Personales y Diezmos (Full-Stack)

Aplicación web moderna para la gestión financiera personal, control de diezmos/porcentajes de ahorro, presupuesto plan vs. real e historial de movimientos.

---

## 🚀 Arquitectura y Tecnologías

El proyecto está estructurado como un **Monorepo**:

* **Frontend (`/frontend`)**:
  * React 18 + TypeScript + Vite
  * Tailwind CSS (Estilo Apple Glassmorphism)
  * Componentes modulares (Dashboard, Control %, Presupuesto, Historial y Modales)

* **Backend (`/backend`)**:
  * Node.js + Express + TypeScript
  * **SQLite Embebida (`sql.js`)** en `/backend/data/database.sqlite`
  * API RESTful para persistencia completa de transacciones, reglas, presupuestos y preferencias de moneda.

---

## 🛠️ Comandos de Ejecución

### 1. Iniciar en Modo Desarrollo (Frontend + Backend en simultáneo)
```bash
npm run dev
```
* **Frontend**: http://localhost:5173
* **Backend**: http://127.0.0.1:3001

### 2. Iniciar Backend o Frontend por separado
```bash
# Servidor Backend Express (escuchando en puerto 3001)
npm run dev:backend

# Cliente Frontend React Vite (escuchando en puerto 5173)
npm run dev:frontend
```

### 3. Compilar para Producción
```bash
npm run build
```

---

## 📊 Endpoints de la API Backend

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/transactions` | Lista los movimientos (filtro opcional `?month=YYYY-MM`) |
| `POST` | `/api/transactions` | Registra un nuevo ingreso o gasto |
| `DELETE` | `/api/transactions/:id` | Elimina una transacción por ID |
| `GET` | `/api/rules` | Obtiene las reglas de asignación por porcentaje (%) |
| `POST` | `/api/rules` | Crea una nueva regla de porcentaje (%) |
| `PUT` | `/api/rules/:id` | Actualiza el porcentaje o datos de una regla |
| `DELETE` | `/api/rules/:id` | Elimina una regla por ID |
| `GET` | `/api/budgets` | Obtiene los presupuestos mensuales planificados |
| `POST` | `/api/budgets` | Guarda/actualiza el presupuesto estimado |
| `POST` | `/api/budgets/copy` | Copia la plantilla del mes anterior |
| `GET` | `/api/settings/:key` | Obtiene ajustes (ej: moneda seleccionada) |
| `POST` | `/api/settings/:key` | Guarda ajustes en la base de datos |

---

## 🗄️ Base de Datos SQLite

La base de datos SQLite se almacena físicamente en:
`backend/data/database.sqlite`

Al arrancar el backend por primera vez, el servidor inicializa automáticamente las tablas y precarga los datos iniciales de demostración.
