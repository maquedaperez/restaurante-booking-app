import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ConfirmReservaRequest,
  DeleteReservaRequest,
  DisponibilidadSlot,
  ListReservasRequest,
  Responsable,
  ReservaUsuario,
  TipoMesa,
  ZonaRestaurante
} from '../models/restaurant.model';
import {
  MOCK_RESPONSABLES,
  MOCK_ZONAS,
  generateMockDisponibilidad,
  getMockTiposMesa,
  mockDeleteReserva,
  mockListReservas,
  mockSaveReserva,
  mockUpdateReserva
} from './mock-data';

const DRAFT_KEY = 'restaurante_reserva_draft';

interface ReservaDraft {
  zona: ZonaRestaurante | null;
  tipoMesa: TipoMesa | null;
  responsable: Responsable | null;
  date: string | null;
  time: string | null;
  slot: DisponibilidadSlot | null;
  partySize: number;
}

function readDraft(): ReservaDraft | null {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ReservaDraft;
  } catch {
    return null;
  }
}

const initialDraft = readDraft();

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  private selectedZona: ZonaRestaurante | null = initialDraft?.zona ?? null;
  private selectedTipoMesa: TipoMesa | null = initialDraft?.tipoMesa ?? null;
  private selectedResponsable: Responsable | null = initialDraft?.responsable ?? null;
  private selectedDate: string | null = initialDraft?.date ?? null;
  private selectedTime: string | null = initialDraft?.time ?? null;
  private selectedSlot: DisponibilidadSlot | null = initialDraft?.slot ?? null;
  private selectedPartySize: number = initialDraft?.partySize ?? 2;

  private persistDraft(): void {
    const draft: ReservaDraft = {
      zona: this.selectedZona,
      tipoMesa: this.selectedTipoMesa,
      responsable: this.selectedResponsable,
      date: this.selectedDate,
      time: this.selectedTime,
      slot: this.selectedSlot,
      partySize: this.selectedPartySize
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }

  getZonas(empresa: number): Observable<ZonaRestaurante[]> {
    if (environment.useMockData) {
      return of(MOCK_ZONAS).pipe(delay(300));
    }
    return this.http.post<ZonaRestaurante[]>(`${this.base}/GrupoActividades/enumerar`, {
      Empresa: empresa
    });
  }

  getTiposMesa(empresa: number, centro: number, grupo: number, relacionCentro: number): Observable<TipoMesa[]> {
    if (environment.useMockData) {
      return of(getMockTiposMesa(grupo)).pipe(delay(300));
    }
    return this.http.post<TipoMesa[]>(`${this.base}/actividadescentro/enumerar`, {
      Empresa: empresa,
      Centro: centro,
      Grupo: grupo,
      RelacionCentro: relacionCentro
    });
  }

  getResponsables(
    empresa: number,
    centro: number,
    grupo: number,
    relacionCentro: number,
    actividadCentro: number
  ): Observable<Responsable[]> {
    if (environment.useMockData) {
      return of(MOCK_RESPONSABLES).pipe(delay(200));
    }
    return this.http.post<Responsable[]>(`${this.base}/monitor/enumerar`, {
      Empresa: empresa,
      Centro: centro,
      Grupo: grupo,
      RelacionCentro: relacionCentro,
      ActividadCentro: actividadCentro
    });
  }

  getDisponibilidad(
    empresa: number,
    monitor: number,
    actividadCentro: number,
    diaInicio: string,
    diaFin: string
  ): Observable<DisponibilidadSlot[]> {
    if (environment.useMockData) {
      return of(generateMockDisponibilidad(diaInicio, diaFin)).pipe(delay(400));
    }
    return this.http.post<DisponibilidadSlot[]>(`${this.base}/disponibilidad/enumerar`, {
      Empresa: empresa,
      Monitor: monitor,
      ActividadCentro: actividadCentro,
      DiaInicio: diaInicio,
      DiaFin: diaFin
    });
  }

  saveReserva(request: ConfirmReservaRequest): Observable<{ idCalendarioCita: number; duracion: number }> {
    if (environment.useMockData) {
      if (this.selectedZona && this.selectedTipoMesa && this.selectedSlot && this.selectedDate) {
        const result = mockSaveReserva(request, this.selectedZona, this.selectedTipoMesa, this.selectedSlot, this.selectedDate);
        return of(result).pipe(delay(500));
      }
      return throwError(() => new Error('Faltan datos de la reserva en curso.'));
    }
    return this.http.post<{ idCalendarioCita: number; duracion: number }>(
      `${this.base}/ClienteUsuario/InsertMeeting`,
      request
    );
  }

  listReservas(request: ListReservasRequest): Observable<ReservaUsuario[]> {
    if (environment.useMockData) {
      return of(mockListReservas(request.clienteUsuarioId)).pipe(delay(300));
    }
    return this.http.post<ReservaUsuario[]>(`${this.base}/ClienteUsuario/ListMeetings`, request);
  }

  updateReserva(idCalendarioCita: number, nuevaFecha: string, nuevoSlot: DisponibilidadSlot): Observable<void> {
    mockUpdateReserva(idCalendarioCita, nuevaFecha, nuevoSlot);
    return of(undefined).pipe(delay(400));
  }

  deleteReserva(request: DeleteReservaRequest): Observable<string> {
    if (environment.useMockData) {
      mockDeleteReserva(request.id);
      return of('OK').pipe(delay(300));
    }
    return this.http.post(`${this.base}/ClienteUsuario/DeleteMeeting`, request, {
      responseType: 'text'
    });
  }

  selectZona(zona: ZonaRestaurante): void {
    this.selectedZona = zona;
    this.persistDraft();
  }

  getSelectedZona(): ZonaRestaurante | null {
    return this.selectedZona;
  }

  selectTipoMesa(tipoMesa: TipoMesa): void {
    this.selectedTipoMesa = tipoMesa;
    this.persistDraft();
  }

  getSelectedTipoMesa(): TipoMesa | null {
    return this.selectedTipoMesa;
  }

  selectResponsable(responsable: Responsable): void {
    this.selectedResponsable = responsable;
    this.persistDraft();
  }

  getSelectedResponsable(): Responsable | null {
    return this.selectedResponsable;
  }

  selectDate(date: string): void {
    this.selectedDate = date;
    this.persistDraft();
  }

  getSelectedDate(): string | null {
    return this.selectedDate;
  }

  selectTime(time: string): void {
    this.selectedTime = time;
    this.persistDraft();
  }

  getSelectedTime(): string | null {
    return this.selectedTime;
  }

  selectSlot(slot: DisponibilidadSlot): void {
    this.selectedSlot = slot;
    this.persistDraft();
  }

  getSelectedSlot(): DisponibilidadSlot | null {
    return this.selectedSlot;
  }

  selectPartySize(partySize: number): void {
    this.selectedPartySize = partySize;
    this.persistDraft();
  }

  getSelectedPartySize(): number {
    return this.selectedPartySize;
  }

  reset(): void {
    this.selectedZona = null;
    this.selectedTipoMesa = null;
    this.selectedResponsable = null;
    this.selectedDate = null;
    this.selectedTime = null;
    this.selectedSlot = null;
    this.selectedPartySize = 2;
    sessionStorage.removeItem(DRAFT_KEY);
  }
}
