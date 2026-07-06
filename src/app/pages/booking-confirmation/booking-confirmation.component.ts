import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import * as QRCode from 'qrcode';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { ReservationService } from '../../core/services/reservation.service';
import { DisponibilidadSlot, TipoMesa, ZonaRestaurante } from '../../core/models/restaurant.model';
import { GuestRegisterData } from '../../core/models/user.model';
import { formatDateLong, formatDateShort } from '../../shared/utils/date-format';

type ViewState = 'summary' | 'loading' | 'error' | 'success';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.scss'
})
export class BookingConfirmationComponent implements OnInit {
  private auth = inject(AuthService);
  private tenantService = inject(TenantService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  tenant = this.tenantService.tenant;
  zona: ZonaRestaurante | null = null;
  tipoMesa: TipoMesa | null = null;
  selectedDate: string | null = null;
  slot: DisponibilidadSlot | null = null;

  observaciones = '';
  state: ViewState = 'summary';
  confirmedId: number | null = null;

  guest: GuestRegisterData = { nombre: '', apellidos: '', email: '', telefono: '' };
  formError = '';

  qrDataUrl: string | null = null;
  shareCopied = false;

  get needsGuestForm(): boolean {
    return !this.auth.isLoggedIn;
  }

  get selectedDateLong(): string {
    return this.selectedDate ? formatDateLong(this.selectedDate) : '';
  }

  get selectedDateShort(): string {
    return this.selectedDate ? formatDateShort(this.selectedDate) : '';
  }

  ngOnInit(): void {
    this.zona = this.reservationService.getSelectedZona();
    this.tipoMesa = this.reservationService.getSelectedTipoMesa();
    this.selectedDate = this.reservationService.getSelectedDate();
    this.slot = this.reservationService.getSelectedSlot();

    if (!this.zona || !this.tipoMesa || !this.selectedDate || !this.slot) {
      this.router.navigate(['/reservar']);
    }
  }

  confirm(): void {
    if (!this.slot) return;

    if (this.needsGuestForm) {
      if (!this.guest.nombre || !this.guest.email || !this.guest.telefono) {
        this.formError = 'Rellena nombre, email y teléfono para confirmar la reserva.';
        return;
      }
      this.formError = '';
      this.auth.registerGuest(this.guest, this.tenant);
    }

    if (!this.auth.currentUser) return;

    this.state = 'loading';

    this.reservationService
      .saveReserva({
        empresa: this.tenant.company,
        clienteUsuarioId: this.auth.currentUser.userId,
        calendarioHorasId: this.slot.id,
        actividadComunidadId: this.slot.calendarioId,
        comentario: this.observaciones
      })
      .subscribe({
        next: (response) => {
          this.confirmedId = response.idCalendarioCita;
          this.state = 'success';
          this.generateQr();
        },
        error: () => {
          this.state = 'error';
        }
      });
  }

  private generateQr(): void {
    const codigo = `RES-${this.confirmedId}`;
    QRCode.toDataURL(codigo, { width: 180, margin: 1 })
      .then((url) => (this.qrDataUrl = url))
      .catch(() => (this.qrDataUrl = null));
  }

  downloadIcs(): void {
    if (!this.slot || !this.selectedDate) return;

    const start = new Date(`${this.selectedDate}T${this.slot.horaInicio}:00`);
    const end = new Date(`${this.selectedDate}T${this.slot.horaFin}:00`);
    const toIcsDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `UID:res-${this.confirmedId}@arti-reserve`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(start)}`,
      `DTEND:${toIcsDate(end)}`,
      `SUMMARY:Reserva en ${this.tenant.name}`,
      `LOCATION:${this.tenant.direccion}`,
      `DESCRIPTION:Mesa en ${this.zona?.descripcion} para tu reserva en ${this.tenant.name}.`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reserva-${this.confirmedId}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async share(): Promise<void> {
    const texto = `Reserva confirmada en ${this.tenant.name} el ${this.selectedDate} a las ${this.slot?.horaInicio}.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: this.tenant.name, text: texto });
      } catch {
        // el usuario canceló el share nativo, no hacemos nada
      }
      return;
    }

    await navigator.clipboard.writeText(texto);
    this.shareCopied = true;
    setTimeout(() => (this.shareCopied = false), 2000);
  }

  retry(): void {
    this.state = 'summary';
  }

  bookAnother(): void {
    this.reservationService.reset();
    this.router.navigate(['/reservar']);
  }
}
