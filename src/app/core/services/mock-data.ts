import {
  ConfirmReservaRequest,
  DisponibilidadSlot,
  Responsable,
  ReservaUsuario,
  TipoMesa,
  ZonaRestaurante
} from '../models/restaurant.model';

const RESERVAS_STORE_KEY = 'restaurante_mock_reservas';
const MEAL_RANGES = [
  { from: 13 * 60, to: 16 * 60 }, // comida
  { from: 20 * 60, to: 23 * 60 } // cena
];

export const MOCK_ZONAS: ZonaRestaurante[] = [
  { id: 1, descripcion: 'Terraza', relacionCentro: 1, descripcionLarga: 'Al aire libre, con vistas al jardín' },
  { id: 2, descripcion: 'Interior', relacionCentro: 1, descripcionLarga: 'Salón principal climatizado' },
  { id: 5, descripcion: 'Ventana', relacionCentro: 1, descripcionLarga: 'Mesas junto al ventanal, luz natural' },
  { id: 3, descripcion: 'Salón Privado', relacionCentro: 1, descripcionLarga: 'Ideal para grupos y celebraciones' },
  { id: 4, descripcion: 'Barra', relacionCentro: 1, descripcionLarga: 'Ambiente informal' }
];

const TIPOS_MESA_POR_ZONA: Record<number, TipoMesa[]> = {
  1: [
    { id: 101, descripcion: 'Mesa 2 personas', actividadId: 101, centroId: 1, duracion: 90 },
    { id: 102, descripcion: 'Mesa 4 personas', actividadId: 102, centroId: 1, duracion: 90 },
    { id: 103, descripcion: 'Mesa redonda 6 personas', actividadId: 103, centroId: 1, duracion: 120 }
  ],
  2: [
    { id: 201, descripcion: 'Mesa 2 personas', actividadId: 201, centroId: 1, duracion: 90 },
    { id: 202, descripcion: 'Mesa 4 personas', actividadId: 202, centroId: 1, duracion: 90 },
    { id: 203, descripcion: 'Mesa 8 personas', actividadId: 203, centroId: 1, duracion: 120 }
  ],
  5: [
    { id: 501, descripcion: 'Mesa 2 personas', actividadId: 501, centroId: 1, duracion: 90 },
    { id: 502, descripcion: 'Mesa 4 personas', actividadId: 502, centroId: 1, duracion: 90 }
  ],
  3: [{ id: 301, descripcion: 'Salón privado (hasta 12 personas)', actividadId: 301, centroId: 1, duracion: 150 }],
  4: [{ id: 401, descripcion: 'Taburete de barra', actividadId: 401, centroId: 1, duracion: 60 }]
};

export function getMockTiposMesa(zonaId: number): TipoMesa[] {
  return TIPOS_MESA_POR_ZONA[zonaId] ?? TIPOS_MESA_POR_ZONA[1];
}

export function autoAssignMesa(zonaId: number, partySize: number): TipoMesa {
  const tipos = getMockTiposMesa(zonaId);
  const capacidadDe = (tipo: TipoMesa): number => {
    const match = tipo.descripcion.match(/(\d+)/);
    return match ? Number(match[1]) : 99;
  };
  const sorted = [...tipos].sort((a, b) => capacidadDe(a) - capacidadDe(b));
  return sorted.find((tipo) => capacidadDe(tipo) >= partySize) ?? sorted[sorted.length - 1];
}

export const MOCK_RESPONSABLES: Responsable[] = [{ id: 1, nombre: 'Equipo de sala', titulo: 'Maître' }];

function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function minutesToHHmm(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

let slotIdCounter = 1;

export function generateMockDisponibilidad(diaInicio: string, diaFin: string): DisponibilidadSlot[] {
  const slots: DisponibilidadSlot[] = [];
  const start = new Date(diaInicio);
  const end = new Date(diaFin);

  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const iso = toIso(cursor);
    for (const range of MEAL_RANGES) {
      for (let mins = range.from; mins < range.to; mins += 30) {
        const seed = (cursor.getDate() * 31 + mins) % 5;
        const disponible = seed !== 0 ? 1 : 0; // ~1 de cada 5 huecos aparece completo
        if (!disponible) continue;
        slots.push({
          id: slotIdCounter++,
          dia: iso,
          horaInicio: minutesToHHmm(mins),
          horaFin: minutesToHHmm(mins + 30),
          monitorId: 1,
          calendarioId: 900000 + slotIdCounter,
          capacidad: 4,
          disponible
        });
      }
    }
  }

  return slots;
}

function readReservasStore(): ReservaUsuario[] {
  const raw = sessionStorage.getItem(RESERVAS_STORE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ReservaUsuario[];
  } catch {
    return [];
  }
}

function writeReservasStore(records: ReservaUsuario[]): void {
  sessionStorage.setItem(RESERVAS_STORE_KEY, JSON.stringify(records));
}

let citaIdCounter = 5000;

export function mockSaveReserva(
  request: ConfirmReservaRequest,
  zona: ZonaRestaurante,
  tipoMesa: TipoMesa,
  slot: DisponibilidadSlot,
  fecha: string
): { idCalendarioCita: number; duracion: number } {
  const records = readReservasStore();
  const idCalendarioCita = citaIdCounter++;
  const nowIso = new Date().toISOString();

  const record: ReservaUsuario = {
    idCalendarioCita,
    idCalendarioHoras: request.calendarioHorasId,
    idClienteUsuario: request.clienteUsuarioId,
    fechaAlta: nowIso,
    comentarios: request.comentario,
    estado: 1,
    estadoDescripcion: 'Confirmada',
    fechaEstado: nowIso,
    idCalendario: request.actividadComunidadId,
    citaDia: fecha,
    citaHoraInicio: slot.horaInicio,
    citaHoraFin: slot.horaFin,
    idActividadComunidad: request.actividadComunidadId,
    actividadNombre: tipoMesa.descripcion,
    idActividad: tipoMesa.id,
    idMonitor: slot.monitorId,
    monitorNombre: MOCK_RESPONSABLES[0]?.nombre ?? '',
    idSala: zona.id,
    salaNombre: zona.descripcion,
    duracion: String(tipoMesa.duracion ?? 90),
    sePuedeCancelar: 1
  };

  records.push(record);
  writeReservasStore(records);

  return { idCalendarioCita, duracion: tipoMesa.duracion ?? 90 };
}

export function mockListReservas(clienteUsuarioId: number): ReservaUsuario[] {
  return readReservasStore().filter((r) => r.idClienteUsuario === clienteUsuarioId);
}

export function mockDeleteReserva(idCalendarioCita: number): void {
  writeReservasStore(readReservasStore().filter((r) => r.idCalendarioCita !== idCalendarioCita));
}

export function mockUpdateReserva(idCalendarioCita: number, nuevaFecha: string, nuevoSlot: DisponibilidadSlot): void {
  const records = readReservasStore();
  const record = records.find((r) => r.idCalendarioCita === idCalendarioCita);
  if (!record) return;
  record.citaDia = nuevaFecha;
  record.citaHoraInicio = nuevoSlot.horaInicio;
  record.citaHoraFin = nuevoSlot.horaFin;
  record.idCalendarioHoras = nuevoSlot.id;
  writeReservasStore(records);
}
