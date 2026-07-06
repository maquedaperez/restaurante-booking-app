import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { ReservationService } from '../../core/services/reservation.service';
import { DisponibilidadSlot, ReservaUsuario } from '../../core/models/restaurant.model';
import { formatDateShort } from '../../shared/utils/date-format';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reservations">
      <h1 class="reservations__title">Mis reservas</h1>

      <div class="reservations__loading" *ngIf="loading">
        <div class="spinner-lg"></div>
      </div>

      <p class="reservations__error" *ngIf="errorMessage">{{ errorMessage }}</p>

      <div *ngIf="!loading && !errorMessage">
        <div class="reservations__empty" *ngIf="proximas.length === 0 && anteriores.length === 0">
          <span class="material-icons-round">event_busy</span>
          <p>Todavía no tienes reservas.</p>
          <button class="btn btn-primary" (click)="goToBooking()">Hacer una reserva</button>
        </div>

        <ng-container *ngIf="proximas.length > 0">
          <h2 class="reservations__section">Próximas reservas</h2>
          <div class="reservations__list">
            <div class="reservation-card" *ngFor="let reserva of proximas">
              <div class="reservation-card__info">
                <div class="reservation-card__row">
                  <span class="material-icons-round">event</span>
                  <span>{{ formatDate(reserva.citaDia) }} · {{ reserva.citaHoraInicio }}</span>
                </div>
                <div class="reservation-card__row" *ngIf="reserva.actividadNombre">
                  <span class="material-icons-round">table_restaurant</span>
                  <span>{{ reserva.actividadNombre }}</span>
                </div>
                <div class="reservation-card__row" *ngIf="reserva.salaNombre">
                  <span class="material-icons-round">place</span>
                  <span>{{ reserva.salaNombre }}</span>
                </div>
              </div>

              <div class="reservation-card__actions" *ngIf="reserva.sePuedeCancelar !== 0">
                <button class="btn btn-outline" (click)="openModifyModal(reserva)">Modificar</button>
                <button class="btn btn-outline-danger" (click)="openCancelModal(reserva)">Cancelar reserva</button>
              </div>
              <span class="badge" *ngIf="reserva.sePuedeCancelar === 0">
                <span class="material-icons-round">lock_clock</span>
                No cancelable
              </span>
            </div>
          </div>
        </ng-container>

        <ng-container *ngIf="anteriores.length > 0">
          <h2 class="reservations__section">Reservas anteriores</h2>
          <div class="reservations__list">
            <div class="reservation-card reservation-card--past" *ngFor="let reserva of anteriores">
              <div class="reservation-card__info">
                <div class="reservation-card__row">
                  <span class="material-icons-round">event</span>
                  <span>{{ formatDate(reserva.citaDia) }} · {{ reserva.citaHoraInicio }}</span>
                </div>
                <div class="reservation-card__row" *ngIf="reserva.actividadNombre">
                  <span class="material-icons-round">table_restaurant</span>
                  <span>{{ reserva.actividadNombre }}</span>
                </div>
              </div>
              <span class="badge">{{ reserva.estadoDescripcion }}</span>
            </div>
          </div>
        </ng-container>
      </div>

      <div class="modal-backdrop" *ngIf="reservaToCancel" (click)="closeCancelModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3 class="modal__title">Cancelar reserva</h3>
          <p class="modal__subtitle">¿Seguro que quieres cancelar esta reserva?</p>
          <label class="field-label" for="motivo">Motivo (opcional)</label>
          <textarea
            id="motivo"
            class="form-control"
            rows="3"
            [(ngModel)]="motivo"
            placeholder="Cuéntanos el motivo..."
          ></textarea>
          <div class="modal__actions">
            <button class="btn btn-outline" (click)="closeCancelModal()" [disabled]="cancelling">Volver</button>
            <button class="btn btn-primary" (click)="confirmCancel()" [disabled]="cancelling">
              <span *ngIf="!cancelling">Confirmar cancelación</span>
              <span *ngIf="cancelling" class="spinner-sm"></span>
            </button>
          </div>
        </div>
      </div>

      <div class="modal-backdrop" *ngIf="reservaToModify" (click)="closeModifyModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3 class="modal__title">Modificar reserva</h3>
          <label class="field-label" for="nueva-fecha">Nueva fecha</label>
          <input
            id="nueva-fecha"
            class="form-control"
            type="date"
            [min]="todayIso"
            [(ngModel)]="nuevaFecha"
            (change)="loadSlotsForNewDate()"
          />

          <div class="modify-slots" *ngIf="modifySlotsLoading">
            <div class="spinner-sm"></div>
          </div>

          <div class="modify-slots__grid" *ngIf="!modifySlotsLoading && nuevoSlots.length > 0">
            <button
              class="time-slot"
              *ngFor="let slot of nuevoSlots"
              [class.time-slot--selected]="nuevoSlot === slot"
              (click)="nuevoSlot = slot"
            >
              {{ slot.horaInicio }}
            </button>
          </div>
          <p class="modify-slots__empty" *ngIf="!modifySlotsLoading && nuevaFecha && nuevoSlots.length === 0">
            No hay horas disponibles ese día.
          </p>

          <div class="modal__actions">
            <button class="btn btn-outline" (click)="closeModifyModal()" [disabled]="modifying">Volver</button>
            <button class="btn btn-primary" (click)="confirmModify()" [disabled]="modifying || !nuevoSlot">
              <span *ngIf="!modifying">Guardar cambios</span>
              <span *ngIf="modifying" class="spinner-sm"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .reservations {
        max-width: 720px;
        margin: 0 auto;
        padding: 32px 24px 60px;
      }
      .reservations__title {
        font-family: var(--font-display);
        font-size: 1.6rem;
        margin-bottom: 24px;
      }
      .reservations__section {
        font-size: 1rem;
        color: var(--color-text-secondary);
        margin: 24px 0 12px;
      }
      .reservations__loading {
        padding: 60px 0;
      }
      .reservations__error {
        color: var(--color-error);
        text-align: center;
        padding: 24px;
      }
      .reservations__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 60px 24px;
        color: var(--color-text-muted);

        .material-icons-round {
          font-size: 48px;
        }
      }
      .reservations__list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .reservation-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        background: var(--color-bg-card);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
        padding: 16px 20px;
        flex-wrap: wrap;
      }
      .reservation-card--past {
        opacity: 0.75;
      }
      .reservation-card__info {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .reservation-card__row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.88rem;
        color: var(--color-text-secondary);

        .material-icons-round {
          font-size: 18px;
          color: var(--color-primary);
        }
      }
      .reservation-card__actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .btn-outline-danger {
        background: transparent;
        border: 1.5px solid var(--color-error);
        color: var(--color-error);
      }
      .btn-outline-danger:hover {
        background: var(--color-error);
        color: #fff;
      }
      .btn-outline {
        background: transparent;
        border: 1.5px solid var(--color-border);
        color: var(--color-text-secondary);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.78rem;
        color: var(--color-text-muted);
        background: var(--color-bg);
        padding: 6px 10px;
        border-radius: var(--radius-sm);

        .material-icons-round {
          font-size: 16px;
        }
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        z-index: 100;
      }
      .modal {
        background: var(--color-bg-card);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: 24px;
        width: 100%;
        max-width: 380px;
        animation: fadeInUp 0.2s ease;
      }
      .modal__title {
        font-size: 1.1rem;
        margin-bottom: 6px;
      }
      .modal__subtitle {
        font-size: 0.88rem;
        color: var(--color-text-muted);
        margin-bottom: 16px;
      }
      .modal__actions {
        display: flex;
        gap: 10px;
        margin-top: 16px;
      }
      .modal__actions .btn {
        flex: 1;
        justify-content: center;
      }
      .field-label {
        display: block;
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        margin-bottom: 6px;
      }
      .modify-slots {
        padding: 16px 0;
        text-align: center;
      }
      .modify-slots__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
        gap: 8px;
        margin-top: 12px;
      }
      .modify-slots__empty {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        margin-top: 12px;
      }
      .time-slot {
        padding: 10px;
        border-radius: var(--radius-sm);
        border: 1.5px solid var(--color-border);
        background: var(--color-bg);
        cursor: pointer;
        font-weight: 500;
        font-size: 0.85rem;
      }
      .time-slot--selected {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: #fff;
      }
      .spinner-sm {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        border-radius: 50%;
        display: inline-block;
        animation: spin 0.8s linear infinite;
      }
    `
  ]
})
export class MyReservationsComponent implements OnInit {
  private auth = inject(AuthService);
  private tenantService = inject(TenantService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  tenant = this.tenantService.tenant;
  loading = true;
  errorMessage = '';
  proximas: ReservaUsuario[] = [];
  anteriores: ReservaUsuario[] = [];

  reservaToCancel: ReservaUsuario | null = null;
  motivo = '';
  cancelling = false;

  reservaToModify: ReservaUsuario | null = null;
  nuevaFecha = '';
  nuevoSlots: DisponibilidadSlot[] = [];
  nuevoSlot: DisponibilidadSlot | null = null;
  modifySlotsLoading = false;
  modifying = false;
  todayIso = this.toIso(new Date());

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const user = this.auth.currentUser;
    if (!user) return;

    this.loading = true;
    this.errorMessage = '';

    const now = new Date();
    const fechaInicio = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const fechaFin = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    this.reservationService
      .listReservas({
        empresa: this.tenant.company,
        clienteUsuarioId: user.userId,
        fechaInicio: this.toIso(fechaInicio),
        fechaFin: this.toIso(fechaFin)
      })
      .subscribe({
        next: (reservas) => {
          const today = this.toIso(now);
          this.proximas = reservas
            .filter((r) => r.citaDia >= today)
            .sort((a, b) => a.citaDia.localeCompare(b.citaDia));
          this.anteriores = reservas
            .filter((r) => r.citaDia < today)
            .sort((a, b) => b.citaDia.localeCompare(a.citaDia));
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'No hemos podido cargar tus reservas.';
          this.loading = false;
        }
      });
  }

  private toIso(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDate(iso: string): string {
    return formatDateShort(iso);
  }

  openCancelModal(reserva: ReservaUsuario): void {
    this.reservaToCancel = reserva;
    this.motivo = '';
  }

  closeCancelModal(): void {
    this.reservaToCancel = null;
    this.motivo = '';
  }

  confirmCancel(): void {
    const reserva = this.reservaToCancel;
    const user = this.auth.currentUser;
    if (!reserva || !user) return;

    this.cancelling = true;

    this.reservationService
      .deleteReserva({
        id: reserva.idCalendarioCita,
        calendarioHoraId: reserva.idCalendarioHoras,
        calendarioId: reserva.idCalendario,
        monitorId: reserva.idMonitor,
        empresaId: this.tenant.company,
        observaciones: this.motivo
      })
      .subscribe({
        next: () => {
          this.cancelling = false;
          this.closeCancelModal();
          this.load();
        },
        error: () => {
          this.cancelling = false;
          this.errorMessage = 'No hemos podido cancelar la reserva. Inténtalo de nuevo.';
        }
      });
  }

  openModifyModal(reserva: ReservaUsuario): void {
    this.reservaToModify = reserva;
    this.nuevaFecha = reserva.citaDia;
    this.nuevoSlots = [];
    this.nuevoSlot = null;
    this.loadSlotsForNewDate();
  }

  closeModifyModal(): void {
    this.reservaToModify = null;
    this.nuevoSlots = [];
    this.nuevoSlot = null;
  }

  loadSlotsForNewDate(): void {
    if (!this.nuevaFecha) return;
    this.modifySlotsLoading = true;
    this.nuevoSlot = null;

    this.reservationService.getDisponibilidad(this.tenant.company, 0, 0, this.nuevaFecha, this.nuevaFecha).subscribe({
      next: (slots) => {
        this.nuevoSlots = slots.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
        this.modifySlotsLoading = false;
      },
      error: () => {
        this.nuevoSlots = [];
        this.modifySlotsLoading = false;
      }
    });
  }

  confirmModify(): void {
    const reserva = this.reservaToModify;
    if (!reserva || !this.nuevoSlot) return;

    this.modifying = true;

    this.reservationService.updateReserva(reserva.idCalendarioCita, this.nuevaFecha, this.nuevoSlot).subscribe({
      next: () => {
        this.modifying = false;
        this.closeModifyModal();
        this.load();
      },
      error: () => {
        this.modifying = false;
        this.errorMessage = 'No hemos podido modificar la reserva. Inténtalo de nuevo.';
      }
    });
  }

  goToBooking(): void {
    this.router.navigate(['/reservar']);
  }
}
