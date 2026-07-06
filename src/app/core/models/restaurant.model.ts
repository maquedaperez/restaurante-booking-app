import { CategoriaCarta, EventoRestaurante, MenuEspecial, Opinion } from './tenant-content.model';

export interface ZonaRestaurante {
  id: number;
  descripcion: string;
  relacionCentro: number;
  descripcionLarga?: string;
}

export interface TipoMesa {
  id: number;
  descripcion: string;
  descripcionLarga?: string;
  icono?: string;
  duracion?: number;
  importe?: number;
  actividadId?: number;
  centroId?: number;
}

export interface Responsable {
  id: number;
  nombre: string;
  titulo?: string;
}

export interface DisponibilidadSlot {
  id: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  monitorId: number;
  calendarioId: number;
  capacidad: number;
  disponible: number;
}

export interface Reserva {
  actividadId: number;
  actividadNombre: string;
  monitorId: number;
  monitorNombre: string;
  date: string;
  time: string;
  timeFin?: string;
  calendarioHorasId: number;
  actividadComunidadId: number;
}

export interface ConfirmReservaRequest {
  empresa: number;
  clienteUsuarioId: number;
  calendarioHorasId: number;
  actividadComunidadId: number;
  comentario: string;
}

export interface ReservaUsuario {
  idCalendarioCita: number;
  idCalendarioHoras: number;
  idClienteUsuario: number;
  fechaAlta: string;
  fechaAsistencia?: string;
  comentarios?: string;
  estado: number;
  estadoDescripcion: string;
  fechaEstado: string;
  idCalendario: number;
  citaDia: string;
  citaHoraInicio: string;
  citaHoraFin: string;
  idActividadComunidad: number;
  actividadNombre: string;
  idActividad: number;
  idMonitor: number;
  monitorNombre: string;
  idSala: number;
  salaNombre: string;
  duracion?: string;
  sePuedeCancelar?: number;
}

export interface DeleteReservaRequest {
  id: number;
  calendarioHoraId: number;
  calendarioId: number;
  monitorId: number;
  empresaId: number;
  observaciones?: string;
}

export interface ListReservasRequest {
  empresa: number;
  clienteUsuarioId: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface TenantConfig {
  company: number;
  businessUnit: number;
  theme: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  primaryDark: string;
  primaryLight: string;
  primarySubtle: string;
  accentColor: string;
  heroImage: string;
  galleryImages: string[];
  carta: CategoriaCarta[];
  menusEspeciales: MenuEspecial[];
  opiniones: Opinion[];
  eventos: EventoRestaurante[];
  rating: number;
  direccion: string;
  telefonoContacto: string;
}
