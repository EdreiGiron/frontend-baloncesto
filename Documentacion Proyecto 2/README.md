# Documentación Proyecto I - Segunda parte : Marcador de baloncesto en tiempo real

## 1. Introducción
SPA construida con Angular 18+ para operar y visualizar un marcador de baloncesto en tiempo real.  
Para esta segunda entrega, el frontend incorpora:
- Autenticación y autorización (flujo de login, rutas protegidas, expiración de sesión).
- Módulos administrativos: Equipos, Jugadores, Torneos, Partidos (creación y roster), e Historial con filtros por equipo, torneo (por nombre) y ronda.
- Sincronización en vivo** con el Tablero Público mediante SignalR.

Requisitos del proyecto: el **Tablero** y el **Control** deben ser **ventanas separadas**; cualquier cambio en Control debe **reflejarse instantáneamente** en Tablero.

---

## 2. Alcance y Requisitos

### 2.1 Funcionales
- **Login**: formulario reactivo, manejo de errores y persistencia de token.
- **Rutas protegidas** (panel admin): Equipos, Jugadores, Torneos, Partidos, Historial.
- **Marcador en tiempo real**: vista Control (operador) y vista **Tablero Público** (sólo lectura) sincronizadas por matchId.
- **Partidos**: creación, gestión de parámetros (ronda, fecha/hora, duración del cuarto), y asignación de roster.
- **Historial**: tabla con filtros por equipo, torneo (por *nombre*) y ronda; acciones de abrir en Control/Tablero.
- **UI/UX**: feedback visual/sonoro al terminar un cuarto; layout responsivo.

### 2.2 No funcionales
- **Usabilidad**: formularios con validación reactiva, mensajes claros y accesibilidad básica (roles ARIA, foco, contraste).
- **Rendimiento**: suscripción eficiente a SignalR, reconexión y resincronización con snapshot del backend.
- **Seguridad**: almacenamiento seguro del token; interceptor HTTP para Authorization y manejo de 401/403.
- **Mantenibilidad**: servicios desacoplados, uso de Signals para estado local, environment.ts por ambiente.
- **Despliegue**: build de producción (ng build --configuration=production) y servicio estático con Nginx (Docker).

---

## 3. Arquitectura Frontend

### 3.1 Módulos y rutas
- **auth**: /login 
- **marcador**:
  - /control/:matchId 
  - /tablero-publico/:matchId 
- **admin**:
  - /equipos
  - /jugadores
  - /torneos
  - /partidos (creación y edición; seteo de duración de cuarto)
  - /historial 

### 3.2 Componentes clave
- **LoginComponent**: form reactivo (email, password), mensajes de error, navegación tras login.
- **ControlPartidoComponent**: botones +1/+2/+3, restar, faltas; cronómetro (start/pause/reset); avanzar cuarto; reinicio global; selección de equipo.
- **TableroPublicoComponent**: renderiza puntajes, nombres/eescudos, cuarto y cronómetro; no expone acciones.
- **HistorialPartidosComponent**: tabla; filtros de equipo, torneo por nombre, ronda; abrir en Control o Tablero con matchId.
- **ABM**: Equipos/Jugadores/Torneos con formularios; tooltip de validación; subida opcional de logo.

### 3.3 Servicios
- **AuthService**: login, logout, getToken, isAuthenticated.
- **AuthInterceptor**: agrega Authorization: Bearer <token>; ante 401 limpia sesión y redirige a /login.
- **MarcadorService**: comandos REST (puntos, faltas, tiempo, cuarto, estado) y carga de snapshot (GET /partidos/{matchId}).
- **SignalRClient**: conexión al MarcadorHub; joinMatch(matchId); reintentos de reconexión; listeners: MarcadorActualizado, TiempoActualizado, FaltasActualizadas, CuartoActualizado, EstadoPartido.
- **EquiposService / JugadoresService / TorneosService / PartidosService**: CRUD/consultas y utilidades para filtros.

### 3.4 Estado y sincronización
- **Fuente de verdad**: backend (REST + SignalR).
- **Flujo recomendado** en /tablero-publico/:matchId y /control/:matchId:
  1) Cargar snapshot con REST (incluye nombres de equipos y marcador actual).  
  2) Unirse al grupo SignalR por matchId.  
  3) Aplicar eventos entrantes para refrescar sólo lo que cambió.  
  4) Si se pierde la conexión: reintentar y, al reconectar, recargar snapshot para coherencia.

---

## 4. UI/UX

### 4.1 Lineamientos
- **Login sin topbar**: el layout oculta la barra en /login y la muestra en módulos internos.
- **Control**: botones grandes, accesibles, espaciado suficiente y confirmaciones mínimas para evitar errores.
- **Tablero**: tipografías amplias, alto contraste, adaptado a pantallas grandes (TV/proyector);

### 4.2 Errores corregidos relevantes
- **Nombres de equipos en Tablero**: se muestran desde el partido seleccionado por matchId (no “Local/Visitante” genéricos).  
---

## 5. Seguridad (Frontend)
- **AuthGuard** en rutas admin; redirección a /login cuando no hay token.
- **AuthInterceptor** añade header Authorization y maneja expiración/redirección.
- **Storage**: token en localStorage o sessionStorage según configuración; limpiar en logout.
- **CORS**: lo controla backend; frontend respeta origen configurado en environment.ts.

---

## 6. Flujo de uso
1. Iniciar sesión en /login.  
2. Crear Partido (equipos, torneo, ronda, fecha/hora, duración del cuarto).  
3. Abrir Control en /control/:matchId.  
4. Abrir el Tablero Público en una segunda ventana /tablero-publico/:matchId.  
5. Gestionar acciones (puntos, faltas, tiempo, cuartos).  
6. Finalizar el partido y verificar en Historial.

---

## 7. Construcción y Despliegue

### 7.1 Desarrollo
```bash
npm install
ng serve -o
```

### 7.2 Producción
```bash
ng build --configuration=production
```

### 7.3 Docker + Nginx guía
**Dockerfile**:
```dockerfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --configuration=production

FROM nginx:stable-alpine
COPY --from=builder /app/dist/<nombre-app>/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf** (SPA):
```nginx
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

}
```

---

## 8. Pruebas

### 8.1 Unitarias
- **Servicios**: AuthService (almacenamiento token), MarcadorService (formación de payloads), filtros de historial (normalización/like).

### 8.2 E2E (Playwright/Cypress)
- Login → navegación protegida.
- Crear partido → abrir Control/Tablero con el mismo matchId.
- Sincronización: ejecutar acciones en Control y verificar reflejo inmediato en Tablero.
- Historial: aplicar filtros (equipo, torneo por nombre, ronda) y validar resultados.

---

## 9. Estándares de Código
- **Angular style guide**: nombres de componentes en *PascalCase*, servicios en *camelCase* con sufijo Service.
- **SCSS modular** y variables de tema (opcional).
- **Tipado estricto** (strict": true en tsconfig.json).
- **Linter/Formatter** (ESLint + Prettier).

---

## 10. Accesibilidad y UX
- Roles ARIA y etiquetas en formularios.
- Estados de foco visibles; tamaños de toque adecuados en botones de Control.
- Mensajes de error y vacíos (“no hay partidos con esos filtros”).

---

## 11. Integrantes
- Edrei Andrés Girón Leonardo / 7690-21-218
- Diego Fernando Velásquez Pichilla / 7690-16-3882
- Edward Alexander Aguilar Flores / 7690-21-7651
