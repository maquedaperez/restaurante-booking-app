# restaurante-booking-app (ARTI Reserve)

PWA de reservas de mesas para restaurante — demo comercial de Artisoftware ("ARTI Reserve"). Angular 17 standalone (sin NgModules), SCSS, backend ARTIBusiness reutilizado de otras apps del mismo proveedor (clínica, hotel...).

## Stack

- Angular 17, standalone components (sin NgModules)
- SCSS, tipografía Montserrat
- Sistema multitenant por dominio (variables CSS)
- Google Material Icons Rounded
- `qrcode` (única dependencia externa, usada solo para el QR de la reserva confirmada)
- Despliegue: Netlify (`netlify.toml`) para la demo; también preparado para Azure Static Web Apps (`staticwebapp.config.json`)
- API backend: ARTIBusiness — `https://webapiartibusiness-dvh6d7b8a7c9dsfr.westeurope-01.azurewebsites.net/api`

## Modo mock (importante)

`src/environments/environment.ts` y `environment.prod.ts` tienen `useMockData: true`. Con el flag activo, **ningún dato de reserva toca el backend real** — zonas, tipos de mesa, disponibilidad, guardar/listar/cancelar/modificar reserva se sirven desde `core/services/mock-data.ts` (datos en memoria + `sessionStorage`). El login (`/Users/authenticate`) y recuperar contraseña (`/Users/forgot`) **no están mockeados**, siguen llamando al backend real.

Cuando se resuelvan los puntos de "Pendiente antes de producción" (más abajo), basta con poner `useMockData: false` para que la app hable con ARTIBusiness sin tocar el resto del código — cada método de `reservation.service.ts` ya tiene ambas ramas (mock y real) escritas.

## Arrancar en desarrollo

```bash
npm install
npx ng serve --proxy-config proxy.conf.json
```

La app queda disponible en `http://localhost:4200`. El proxy reenvía `/api/*` al backend real evitando problemas de CORS (ver `proxy.conf.json`) — relevante solo para login/forgot-password mientras el resto está mockeado.

## Build de producción

```bash
npx ng build --configuration production
```

`angular.json` tiene un `fileReplacements` que sustituye `environment.ts` (usa `/api`, resuelto por el proxy en dev) por `environment.prod.ts` (URL absoluta de ARTIBusiness) al compilar en modo producción.

## Despliegue

- **Netlify** (demo actual): `netlify.toml` define el build (`npm run build -- --configuration production`) y la carpeta de publicación (`dist/restaurante-booking-app/browser`, la ruta con la que el nuevo builder de Angular 17 saca el bundle de navegador), más una regla de redirect `/* → /index.html` para que el routing de Angular funcione.
- **Azure Static Web Apps** (alternativa): `staticwebapp.config.json` con el mismo fallback de navegación.

## Estructura de carpetas

```
src/app/
  core/
    models/
      user.model.ts            # User (+ preferencias/cumpleanos/alergias), AuthRequest, ForgotRequest, GuestRegisterData
      restaurant.model.ts       # Zonas, tipos de mesa, disponibilidad, reservas, TenantConfig
      tenant-content.model.ts   # PlatoCarta, CategoriaCarta, MenuEspecial, Opinion, EventoRestaurante
    services/
      auth.service.ts           # login/forgotPassword reales + registerGuest/updateProfile mock, sesión en sessionStorage
      tenant.service.ts         # resolución de tenant por dominio + variables CSS + contenido (carta, fotos, opiniones...)
      reservation.service.ts    # cada método con rama mock (useMockData) y rama real (http), + estado de la reserva en sessionStorage
      mock-data.ts              # generadores mock: zonas, tipos de mesa, disponibilidad, autoAssignMesa, store de reservas
    guards/
      auth.guard.ts             # authGuard funcional (CanActivateFn), solo protege my-reservations y profile
    interceptors/
      auth.interceptor.ts       # añade Bearer token, gestiona 401
  pages/
    splash/                     # pantalla de marca 2s al arrancar, redirige a /landing
    landing/                    # microsite del restaurante: hero, opiniones (carrusel), platos destacados, galería (lightbox), menús especiales, mapa, contacto, footer
    carta/                      # carta completa por categorías con fotos, tags (Vegetariano/Sin gluten...) y menús especiales
    eventos/                    # lista de eventos del restaurante
    reservar/                   # wizard: Personas → Zona → Fecha → Hora → Resumen
    booking-confirmation/       # identificación (registro de invitado) + confirmación con QR, añadir a calendario (.ics) y compartir
    login/, forgot-password/    # acceso real contra ARTIBusiness (opcional, no es el camino principal)
    my-reservations/            # próximas/anteriores, cancelar, modificar (cambiar fecha/hora)
    profile/                    # datos, preferencias/cumpleaños/alergias, historial
  shared/
    components/
      header/                   # logo + nombre; nav completo si hay sesión, "Iniciar sesión" si no
      bottom-nav/                # navegación inferior, visible siempre (móvil y escritorio)
    animations/
      route-fade.animation.ts   # fundido suave entre páginas al navegar
    utils/
      date-format.ts            # formatDateLong ("lunes 6 de julio de 2026"), formatDateShort ("06/07/2026")
```

## Modelos principales

Ver `core/models/*.ts`. Terminología:

- **Zona** (`ZonaRestaurante`) → equivale a "servicio" / grupo de actividades.
- **Tipo de mesa** (`TipoMesa`) → equivale a "actividad dentro de un centro". Ya no se elige manualmente en el flujo de reserva: se asigna automáticamente según el nº de comensales (`autoAssignMesa` en `mock-data.ts`).
- **Responsable** (`Responsable`) → equivale a "monitor" (maître, camarero responsable, etc.). Auto-asignado, no se le pide al cliente que elija.
- **Slot de disponibilidad** (`DisponibilidadSlot`) → horario concreto disponible para reservar.
- **Reserva del usuario** (`ReservaUsuario`) → reserva confirmada, con `sePuedeCancelar` indicando si admite cancelación.
- **TenantConfig** → toda la configuración e identidad de un restaurante: colores, logo, imágenes (hero, galería), carta, menús especiales, opiniones, eventos, rating, horario, contacto (dirección, teléfono, WhatsApp, web).

## Endpoints de la API (ARTIBusiness)

Todas las peticiones son `POST` sobre `apiBaseUrl`. Con `useMockData: true`, todos menos login/forgot están servidos por `mock-data.ts` en vez de llamar a estos endpoints.

| Acción | Endpoint | Payload |
|---|---|---|
| Login | `/Users/authenticate` | `{ company, businessUnit, username, password, theme, validationCode }` |
| Recuperar contraseña | `/Users/forgot` | `{ company, businessUnit, username, password, theme, validationCode }` |
| Listar zonas | `/GrupoActividades/enumerar` | `{ Empresa }` |
| Listar tipos de mesa | `/actividadescentro/enumerar` | `{ Empresa, Centro, Grupo, RelacionCentro }` |
| Listar responsables | `/monitor/enumerar` | `{ Empresa, Centro, Grupo, RelacionCentro, ActividadCentro }` |
| Disponibilidad de horarios | `/disponibilidad/enumerar` | `{ Empresa, Monitor, ActividadCentro, DiaInicio, DiaFin }` |
| Confirmar reserva | `/ClienteUsuario/InsertMeeting` | `{ empresa, clienteUsuarioId, calendarioHorasId, actividadComunidadId, comentario }` → `{ idCalendarioCita, duracion }` |
| Listar reservas del usuario | `/ClienteUsuario/ListMeetings` | `{ empresa, clienteUsuarioId, fechaInicio, fechaFin }` |
| Cancelar reserva | `/ClienteUsuario/DeleteMeeting` | `{ id, calendarioHoraId, calendarioId, monitorId, empresaId, observaciones }` (respuesta en texto plano) |

Todas las peticiones autenticadas llevan `Authorization: Bearer <token>` añadida por `auth.interceptor.ts`. Un `401` limpia la sesión y redirige a `/login`.

**No existen todavía** (hay que pedirlos al equipo de ARTIBusiness antes de desactivar el mock):
- Endpoint de alta de `ClienteUsuario` (el registro del invitado ocurre al confirmar la reserva, no al principio — hace falta un endpoint que dé de alta y devuelva un id).
- Endpoint de modificar una reserva (hoy solo hay crear/listar/cancelar).
- Aclarar si las lecturas (zonas, tipos de mesa, disponibilidad) pueden hacerse sin sesión previa, ya que el cliente navega como invitado antes de identificarse.
- Aclarar qué mandar como `Monitor` en `/disponibilidad/enumerar` cuando no hay responsable elegido por el cliente (¿vale `0`, o hay que iterar `/monitor/enumerar`?).

## Sistema multitenant

`tenant.service.ts` resuelve el tenant según `window.location.hostname` usando `DOMAIN_MAP`. Aplica variables CSS (`--color-primary`, `--color-primary-dark`, `--color-primary-light`, `--color-primary-subtle`, `--color-accent`) sobre `document.documentElement` al arrancar.

### Añadir un nuevo tenant

1. Copia el bloque de `restaurantetheme` dentro de `TENANTS` en `tenant.service.ts`, con una clave nueva, y rellena **todos** los campos de `TenantConfig`: `company`/`businessUnit` reales de ARTIBusiness, colores, `logoUrl`, `heroImage`, `galleryImages`, `carta` (con `imagen`/`unidad`/`tags` opcionales por plato y categoría), `menusEspeciales`, `opiniones`, `eventos`, `rating`, `reviewCount`, `tipoCocina`, `horario`, `direccion`, `telefonoContacto`, `whatsapp`, `website`.
2. Sube sus imágenes a `src/assets/images/` (recomendado: una subcarpeta por restaurante en cuanto haya más de uno, para no pisar nombres de archivo).
3. Añade su dominio en `DOMAIN_MAP` apuntando a la clave del tenant.

Un mismo despliegue puede servir varios dominios distintos a la vez (cada uno mostrando su propio tenant), sin necesidad de builds ni despliegues separados por restaurante.

> **Importante:** el tenant de ejemplo (`restaurantetheme`, "Restaurante Alameda") usa `company: 99` y `businessUnit: 200` como placeholders, y fotos que hay que sustituir en `src/assets/images/` (`hero.jpg`, `gallery-1.jpg`...`gallery-4.jpg`, `entrantes.jpg`, `principal.jpg`, `postre.jpg`, `menu-especial.jpg`, `splash-brand.png`). Antes de producción hay que ajustar los IDs reales y las fotos reales del restaurante.

## Flujo de usuario

1. `/` → `/splash` (2s, logo de marca) → `/landing`.
2. `/landing` → microsite del restaurante (hero con CTA, opiniones en carrusel, platos destacados, galería, menús especiales, mapa, contacto). Navegación libre, sin login.
3. `/reservar` → wizard de 5 pasos: Personas → Zona (con auto-asignación de mesa según aforo) → Fecha → Hora → Resumen.
4. `/confirmation` → si no hay sesión, pide nombre/apellidos/email/teléfono (esto da de alta al invitado, mock) + observaciones → confirma → pantalla de éxito con QR, botón "Añadir al calendario" (.ics) y "Compartir".
5. `/my-reservations` (requiere sesión) → próximas/anteriores, cancelar, modificar fecha/hora.
6. `/profile` (requiere sesión) → datos, preferencias/cumpleaños/alergias editables, historial de reservas pasadas.
7. `/login`, `/forgot-password` → acceso real contra ARTIBusiness para quien ya tenga cuenta; no es el camino principal de la demo.

El estado de la reserva en curso (personas, zona, tipo de mesa, fecha, hora, slot) se persiste en `sessionStorage` vía `ReservationService`, sobrevive a un refresco de página, y se limpia con `reset()` al cerrar sesión o tras completar una reserva.

## Reglas de implementación seguidas

- Todos los componentes son `standalone: true`.
- Inyección de dependencias con `inject()`, no constructor injection.
- Sin `NgModule`: solo `app.config.ts` con `provideRouter`, `provideHttpClient(withInterceptors([authInterceptor]))` y `provideAnimations`.
- Componentes simples (`forgot-password`, `my-reservations`, `profile`, `header`, `bottom-nav`, `carta`, `eventos`, `splash`) con template y estilos inline en el `.ts`.
- Componentes con HTML más complejo (`login`, `reservar`, `landing`, `booking-confirmation`) con archivos `.html`/`.scss` separados.
- Diseño responsive, mobile-first, con menú inferior (bottom-nav) siempre visible, también en escritorio.
- Sin librerías de UI externas, salvo `qrcode` (generación del código QR de la reserva confirmada).
- Los grids con nº variable de tarjetas usan `repeat(auto-fit, minmax(...))`, nunca `auto-fill` — con `auto-fill` el navegador reserva columnas vacías al final en vez de dejar que las tarjetas existentes ocupen el espacio, y el contenido queda descuadrado a la izquierda en pantallas anchas.
- Evitar múltiples `| async` sobre el mismo observable en una misma plantilla (usar `*ngIf="obs$ | async as valor"` una vez y reutilizar `valor`) — cada `| async` es una suscripción independiente, y si el valor es un objeto no primitivo (p. ej. un `SafeResourceUrl`), cada reevaluación crea una instancia nueva y puede provocar recargas/parpadeos donde se use ese binding (pasó con el iframe del mapa).

## Pendiente antes de producción

- Resolver los 4 puntos de la sección "Endpoints" (alta de cliente, modificar reserva, lecturas sin sesión, parámetro `Monitor`) con el equipo de ARTIBusiness, y entonces poner `useMockData: false`.
- Ajustar `company` y `businessUnit` del tenant a los IDs reales del restaurante.
- Sustituir las imágenes placeholder en `src/assets/images/` por las fotos reales del restaurante.
- Configurar el dominio real en `DOMAIN_MAP` de `tenant.service.ts`.
- Decidir el Place ID de Google del restaurante y un proceso (aunque sea manual al principio) para traer opiniones reales de Google en vez de las 3 hardcodeadas en `tenant.service.ts`.
