import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';
import { ReservationService } from '../../core/services/reservation.service';
import { autoAssignMesa } from '../../core/services/mock-data';
import { DisponibilidadSlot, ZonaRestaurante } from '../../core/models/restaurant.model';
import { formatDateLong } from '../../shared/utils/date-format';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isoDate: string;
  inMonth: boolean;
  isPast: boolean;
  hasAvailability: boolean;
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

type Step = 1 | 2 | 3 | 4 | 5;

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar.component.html',
  styleUrl: './reservar.component.scss'
})
export class ReservarComponent implements OnInit {
  private tenantService = inject(TenantService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  tenant = this.tenantService.tenant;
  step: Step = 1;

  partyOptions = [1, 2, 3, 4, 5];
  partySize = 2;
  showCustomParty = false;
  customPartySize = 6;

  weekdays = WEEKDAYS;
  today = this.stripTime(new Date());
  viewMonth = this.stripTime(new Date());
  minMonth = this.stripTime(new Date());
  calendarDays: CalendarDay[] = [];
  slotsByDay = new Map<string, DisponibilidadSlot[]>();
  loading = true;
  errorMessage = '';

  selectedDate: string | null = null;
  selectedDaySlots: DisponibilidadSlot[] = [];
  selectedSlot: DisponibilidadSlot | null = null;

  zonas: ZonaRestaurante[] = [];
  zonasLoading = false;
  selectedZona: ZonaRestaurante | null = null;

  get monthLabel(): string {
    return `${MONTH_NAMES[this.viewMonth.getMonth()]} ${this.viewMonth.getFullYear()}`;
  }

  get canGoPrevMonth(): boolean {
    return (
      this.viewMonth.getFullYear() > this.minMonth.getFullYear() ||
      (this.viewMonth.getFullYear() === this.minMonth.getFullYear() &&
        this.viewMonth.getMonth() > this.minMonth.getMonth())
    );
  }

  get selectedDateLabel(): string {
    return this.selectedDate ? formatDateLong(this.selectedDate) : '';
  }

  get comidaSlots(): DisponibilidadSlot[] {
    return this.selectedDaySlots.filter((slot) => this.isComida(slot));
  }

  get cenaSlots(): DisponibilidadSlot[] {
    return this.selectedDaySlots.filter((slot) => !this.isComida(slot));
  }

  private isComida(slot: DisponibilidadSlot): boolean {
    return Number(slot.horaInicio.split(':')[0]) < 18;
  }

  iconFor(zona: ZonaRestaurante): string {
    const descripcion = zona.descripcion.toLowerCase();
    if (descripcion.includes('terraza')) return 'deck';
    if (descripcion.includes('ventana')) return 'wb_sunny';
    if (descripcion.includes('interior')) return 'restaurant';
    if (descripcion.includes('privad')) return 'meeting_room';
    if (descripcion.includes('barra')) return 'local_bar';
    return 'table_restaurant';
  }

  ngOnInit(): void {
    this.partySize = this.reservationService.getSelectedPartySize() || 2;
    this.loadMonth(this.viewMonth);
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private toIso(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectPartySize(size: number): void {
    this.partySize = size;
    this.showCustomParty = false;
    this.reservationService.selectPartySize(size);
    this.step = 2;
  }

  toggleCustomParty(): void {
    this.showCustomParty = true;
  }

  confirmCustomParty(): void {
    const size = Math.max(6, Math.floor(this.customPartySize || 6));
    this.selectPartySize(size);
  }

  private loadMonth(monthDate: Date): void {
    this.loading = true;
    this.errorMessage = '';

    const isCurrentMonth =
      monthDate.getFullYear() === this.today.getFullYear() && monthDate.getMonth() === this.today.getMonth();

    const diaInicio = isCurrentMonth
      ? this.toIso(this.today)
      : this.toIso(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
    const diaFin = this.toIso(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0));

    this.reservationService.getDisponibilidad(this.tenant.company, 0, 0, diaInicio, diaFin).subscribe({
      next: (slots) => {
        this.slotsByDay = new Map();
        for (const slot of slots) {
          const key = slot.dia.substring(0, 10);
          const list = this.slotsByDay.get(key) ?? [];
          list.push(slot);
          this.slotsByDay.set(key, list);
        }
        this.buildCalendar(monthDate);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No hemos podido cargar la disponibilidad.';
        this.loading = false;
      }
    });
  }

  private buildCalendar(monthDate: Date): void {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: CalendarDay[] = [];

    for (let i = 0; i < firstWeekday; i++) {
      const date = new Date(year, month, 1 - (firstWeekday - i));
      days.push(this.toCalendarDay(date, false));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push(this.toCalendarDay(date, true));
    }

    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].date;
      const date = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      days.push(this.toCalendarDay(date, false));
    }

    this.calendarDays = days;
  }

  private toCalendarDay(date: Date, inMonth: boolean): CalendarDay {
    const iso = this.toIso(date);
    return {
      date,
      dayNumber: date.getDate(),
      isoDate: iso,
      inMonth,
      isPast: date < this.today,
      hasAvailability: (this.slotsByDay.get(iso)?.length ?? 0) > 0
    };
  }

  prevMonth(): void {
    if (!this.canGoPrevMonth) return;
    this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() - 1, 1);
    this.loadMonth(this.viewMonth);
  }

  nextMonth(): void {
    this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() + 1, 1);
    this.loadMonth(this.viewMonth);
  }

  selectDay(day: CalendarDay): void {
    if (!day.inMonth || day.isPast || !day.hasAvailability) return;
    this.selectedDate = day.isoDate;
    this.selectedDaySlots = (this.slotsByDay.get(day.isoDate) ?? []).sort((a, b) =>
      a.horaInicio.localeCompare(b.horaInicio)
    );
    this.selectedSlot = null;
    this.reservationService.selectDate(day.isoDate);
    this.step = 3;
  }

  selectSlot(slot: DisponibilidadSlot): void {
    this.selectedSlot = slot;
    this.reservationService.selectSlot(slot);
    this.reservationService.selectTime(slot.horaInicio);
    this.loadZonas();
    this.step = 4;
  }

  private loadZonas(): void {
    if (this.zonas.length > 0) return;
    this.zonasLoading = true;
    this.reservationService.getZonas(this.tenant.company).subscribe({
      next: (zonas) => {
        this.zonas = zonas;
        this.zonasLoading = false;
      },
      error: () => {
        this.zonasLoading = false;
      }
    });
  }

  selectZona(zona: ZonaRestaurante): void {
    this.selectedZona = zona;
    this.reservationService.selectZona(zona);
    const mesa = autoAssignMesa(zona.id, this.partySize);
    this.reservationService.selectTipoMesa(mesa);
    this.step = 5;
  }

  goToConfirmation(): void {
    this.router.navigate(['/confirmation']);
  }

  back(): void {
    if (this.step > 1) {
      this.step = (this.step - 1) as Step;
      return;
    }
    this.router.navigate(['/landing']);
  }
}
