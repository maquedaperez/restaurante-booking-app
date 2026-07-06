# restaurante-booking-app

Aplicación web de reservas de mesas para restaurante. Angular 17 standalone (sin NgModules), SCSS, despliegue en Azure Static Web Apps, backend ARTIBusiness.

## Stack

- Angular 17, standalone components (sin NgModules)
- SCSS
- Sistema multitenant por dominio (variables CSS)
- Google Material Icons Rounded
- Despliegue: Azure Static Web Apps
- API backend: ARTIBusiness — `https://webapiartibusiness-dvh6d7b8a7c9dsfr.westeurope-01.azurewebsites.net/api`

## Arrancar en desarrollo

```bash
npm install
npx ng serve --proxy-config proxy.conf.json
```

La app queda disponible en `http://localhost:4200`. El proxy reenvía `/api/*` al backend real evitando problemas de CORS (ver `proxy.conf.json`).

## Build de producción

```bash
npx ng build --configuration production
```

`angular.json` tiene configurado un `fileReplacements` que sustituye `src/environments/environment.ts` (que usa `/api`, resuelto por el proxy en dev) por `src/environments/environment.prod.ts` (que apunta directamente a la URL absoluta de ARTIBusiness) al compilar en modo producción.

## Despliegue en Azure Static Web Apps

`staticwebapp.config.json` en la raíz configura el fallback de navegación para que el enrutado de Angular (SPA) funcione correctamente en Azure:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "*.{css,js,png,webp,ico}"]
  }
}
```

## Estructura de carpetas

```
src/app/
  core/
    models/
      user.model.ts          # User, AuthRequest, ForgotRequest
      restaurant.model.ts     # Zonas, tipos de mesa, disponibilidad, reservas, tenant
    services/
      auth.service.ts         # login, forgotPassword, sesión en sessionStorage
      tenant.service.ts       # resolución de tenant por dominio + variables CSS
      reservation.service.ts  # llamadas a la API + estado de la reserva en curso
    guards/
      auth.guard.ts           # authGuard funcional (CanActivateFn)
    interceptors/
      auth.interceptor.ts     # añade Bearer token, gestiona 401
  pages/
    login/
    forgot-password/
    zones/                    # selección de zona (Terraza, Interior, Privado, Barra...)
    tables/                   # selección de tipo de mesa dentro de la zona
    booking/                  # stepper de 2 pasos: fecha (calendario) → hora (slots)
    booking-confirmation/     # resumen + observaciones + confirmación
    my-reservations/          # próximas / anteriores + cancelación
    profile/
  shared/
    components/
      header/                 # logo, "Mis reservas", "Perfil", "Salir"
```

## Modelos principales

Ver `core/models/user.model.ts` y `core/models/restaurant.model.ts`. Terminología usada:

- **Zona** (`ZonaRestaurante`) → equivale a "servicio" / grupo de actividades.
- **Tipo de mesa** (`TipoMesa`) → equivale a "actividad dentro de un centro".
- **Responsable** (`Responsable`) → equivale a "monitor" (maître, camarero responsable, etc.).
- **Slot de disponibilidad** (`DisponibilidadSlot`) → horario concreto disponible para reservar.
- **Reserva del usuario** (`ReservaUsuario`) → reserva ya confirmada, con `sePuedeCancelar` indicando si admite cancelación.

## Endpoints de la API (ARTIBusiness)

Todas las peticiones son `POST` sobre `apiBaseUrl` (`/api` en dev vía proxy, URL absoluta en producción).

| Acción | Endpoint | Payload |
|---|---|---|
| Login | `/Users/authenticate` | `{ company, businessUnit, username, password, theme, validationCode }` |
| Recuperar contraseña | `/Users/forgot` | `{ company, businessUnit, username, password, theme, validationCode }` |
| Listar zonas | `/GrupoActividades/enumerar` | `{ Empresa }` |
| Listar tipos de mesa | `/actividadescentro/enumerar` | `{ Empresa, Centro, Grupo, RelacionCentro }` |
| Listar responsables | `/monitor/enumerar` | `{ Empresa, Centro, Grupo, RelacionCentro, ActividadCentro }` |
| Disponibilidad de horarios | `/disponibilidad/enumerar` | `{ Empresa, Monitor, ActividadCentro, DiaInicio, DiaFin }` |
| Confirmar reserva | `/ClienteUsuario/InsertMeeting` | `{ empresa, clienteUsuarioId, calendarioHorasId, actividadComunidadId, comentario }` → responde `{ idCalendarioCita, duracion }` |
| Listar reservas del usuario | `/ClienteUsuario/ListMeetings` | `{ empresa, clienteUsuarioId, fechaInicio, fechaFin }` |
| Cancelar reserva | `/ClienteUsuario/DeleteMeeting` | `{ id, calendarioHoraId, calendarioId, monitorId, empresaId, observaciones }` (respuesta en texto plano) |

Todas las peticiones autenticadas llevan la cabecera `Authorization: Bearer <token>` añadida por `auth.interceptor.ts`. Un `401` limpia la sesión y redirige a `/login`.

## Sistema multitenant

`tenant.service.ts` resuelve el tenant según `window.location.hostname` usando un `domainMap`. Aplica las variables CSS (`--color-primary`, `--color-primary-dark`, `--color-primary-light`, `--color-primary-subtle`, `--color-accent`) sobre `document.documentElement` al arrancar la app.

### Añadir un nuevo tenant

1. Añade una entrada en el objeto `TENANTS` de `src/app/core/services/tenant.service.ts` con los datos reales del restaurante (`company`, `businessUnit`, colores, logo, etc.).
2. Añade el dominio correspondiente en `DOMAIN_MAP`, apuntando a la clave del tenant creado en el paso anterior.
3. Coloca el logo del restaurante en `src/assets/images/` y referencia esa ruta en `logoUrl`.

```ts
otrorestaurante: {
  company: 123,
  businessUnit: 45,
  theme: 'otrorestaurante',
  name: 'Otro Restaurante',
  logoUrl: 'assets/images/otro-logo.webp',
  primaryColor: '#2c7a4b',
  primaryDark: '#1f5a37',
  primaryLight: '#3fa568',
  primarySubtle: '#d9f0e2',
  accentColor: '#f39c12'
}
```

```ts
const DOMAIN_MAP: Record<string, string> = {
  localhost: 'restaurantetheme',
  'otrorestaurante.com': 'otrorestaurante'
};
```

> **Importante:** el tenant de ejemplo (`restaurantetheme`) usa `company: 99` y `businessUnit: 200` como placeholders. Antes de desplegar a producción hay que ajustarlos a los IDs reales del restaurante en ARTIBusiness, y verificar el endpoint de disponibilidad respecto a cómo espera el parámetro `Monitor` cuando no hay responsable seleccionado (se usa `0` o el primer responsable devuelto por `/monitor/enumerar`).

## Flujo de usuario

1. `/login` → autenticación con email + contraseña.
2. `/zones` → elige zona del restaurante (Terraza, Interior, Salón Privado, Barra...).
3. `/tables` → elige tipo de mesa dentro de la zona seleccionada.
4. `/booking` → stepper de 2 pasos: calendario mensual (fecha) → grid de horas disponibles.
5. `/confirmation` → resumen de la reserva, observaciones opcionales, confirmación con estados de carga/error/éxito.
6. `/my-reservations` → ver reservas próximas y anteriores, cancelar si `sePuedeCancelar !== 0`.
7. `/profile` → datos del usuario y cierre de sesión.

El estado de la reserva en curso (zona, tipo de mesa, responsable, fecha, hora, slot) se guarda en memoria en `ReservationService` y se limpia con `reset()` al cerrar sesión o tras completar una reserva.

## Reglas de implementación seguidas

- Todos los componentes son `standalone: true`.
- Inyección de dependencias con `inject()`, no constructor injection.
- Sin `NgModule`: solo `app.config.ts` con `provideRouter`, `provideHttpClient(withInterceptors([authInterceptor]))` y `provideAnimations`.
- Componentes simples (`forgot-password`, `my-reservations`, `profile`, `header`) con template y estilos inline en el `.ts`.
- Componentes con HTML más complejo (`login`, `zones`, `tables`, `booking`, `booking-confirmation`) con archivos `.html` y `.scss` separados.
- Diseño responsive, mobile-first, sin librerías de UI externas.

## Pendiente antes de producción

- Ajustar `company` y `businessUnit` del tenant al restaurante real.
- Sustituir el logo placeholder (`src/assets/images/logo.svg`) por el logo real del restaurante.
- Confirmar con el backend cómo se debe tratar `Monitor` en `/disponibilidad/enumerar` cuando el restaurante no usa el concepto de responsable/monitor por mesa.
- Configurar el dominio real en `DOMAIN_MAP` de `tenant.service.ts`.
