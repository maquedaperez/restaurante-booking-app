import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { ReservationService } from '../../core/services/reservation.service';
import { ReservaUsuario } from '../../core/models/restaurant.model';
import { formatDateShort } from '../../shared/utils/date-format';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile">
      <div class="profile__card" *ngIf="user">
        <div class="profile__avatar">
          <span class="material-icons-round">person</span>
        </div>
        <h1 class="profile__name">{{ user.userFirstName }} {{ user.userLastName }}</h1>

        <div class="profile__row">
          <span class="material-icons-round">email</span>
          <span>{{ user.userEmail }}</span>
        </div>
        <div class="profile__row" *ngIf="user.userPhone">
          <span class="material-icons-round">phone</span>
          <span>{{ user.userPhone }}</span>
        </div>

        <button class="btn btn-outline-danger btn-block" (click)="logout()">
          <span class="material-icons-round">logout</span>
          Cerrar sesión
        </button>
      </div>

      <div class="profile__section" *ngIf="user">
        <h2>Preferencias</h2>
        <label class="field-label" for="preferencias">Preferencias</label>
        <textarea
          id="preferencias"
          class="form-control"
          rows="2"
          [(ngModel)]="preferencias"
          placeholder="Mesa junto a la ventana, ambiente tranquilo..."
        ></textarea>

        <label class="field-label" for="cumpleanos">Cumpleaños</label>
        <input id="cumpleanos" class="form-control" type="date" [(ngModel)]="cumpleanos" />

        <label class="field-label" for="alergias">Alergias</label>
        <input id="alergias" class="form-control" type="text" [(ngModel)]="alergias" placeholder="Frutos secos, gluten..." />

        <button class="btn btn-primary btn-block" (click)="guardarPreferencias()">Guardar preferencias</button>
        <p class="profile__saved" *ngIf="saved">Guardado.</p>
      </div>

      <div class="profile__section" *ngIf="user">
        <h2>Historial de reservas</h2>
        <div class="profile__loading" *ngIf="historialLoading">
          <div class="spinner-sm"></div>
        </div>
        <p class="profile__empty" *ngIf="!historialLoading && historial.length === 0">Todavía no tienes reservas anteriores.</p>
        <div class="history-item" *ngFor="let reserva of historial">
          <span class="material-icons-round">event</span>
          <span>{{ formatDate(reserva.citaDia) }} · {{ reserva.citaHoraInicio }} · {{ reserva.actividadNombre }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .profile {
        max-width: 420px;
        margin: 0 auto;
        padding: 40px 24px 60px;
      }
      .profile__card {
        background: var(--color-bg-card);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: 32px;
        text-align: center;
        margin-bottom: 24px;
      }
      .profile__avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: var(--color-primary-subtle);
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;

        .material-icons-round {
          font-size: 36px;
        }
      }
      .profile__name {
        font-family: var(--font-display);
        font-size: 1.3rem;
        margin-bottom: 20px;
      }
      .profile__row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        margin-bottom: 10px;

        .material-icons-round {
          font-size: 18px;
          color: var(--color-primary);
        }
      }
      .btn-outline-danger {
        background: transparent;
        border: 1.5px solid var(--color-error);
        color: var(--color-error);
        margin-top: 20px;
      }
      .btn-outline-danger:hover {
        background: var(--color-error);
        color: #fff;
      }
      .profile__section {
        background: var(--color-bg-card);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        padding: 24px;
        margin-bottom: 20px;

        h2 {
          font-family: var(--font-display);
          font-size: 1.05rem;
          margin-bottom: 16px;
        }
      }
      .field-label {
        display: block;
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        margin: 12px 0 6px;
      }
      .profile__section .form-control {
        margin-bottom: 14px;
        box-sizing: border-box;
        min-width: 0;
      }
      .profile__section input[type='date'].form-control {
        padding: 10px 10px;
        font-size: 0.85rem;
      }
      @media (max-width: 380px) {
        .profile__section input[type='date'].form-control {
          padding: 8px 6px;
          font-size: 0.78rem;
        }
      }
      .profile__section .btn-block {
        margin-top: 4px;
      }
      .profile__saved {
        color: var(--color-success);
        font-size: 0.82rem;
        margin-top: 10px;
        text-align: center;
      }
      .profile__loading {
        padding: 12px 0;
        text-align: center;
      }
      .profile__empty {
        font-size: 0.85rem;
        color: var(--color-text-muted);
      }
      .history-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        padding: 8px 0;
        border-bottom: 1px solid var(--color-border);

        .material-icons-round {
          font-size: 18px;
          color: var(--color-primary);
        }
      }
      .spinner-sm {
        width: 18px;
        height: 18px;
        border: 2px solid var(--color-primary-subtle);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        display: inline-block;
        animation: spin 0.8s linear infinite;
        margin: 0 auto;
      }
    `
  ]
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private tenantService = inject(TenantService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  tenant = this.tenantService.tenant;
  user = this.auth.currentUser;

  preferencias = this.user?.preferencias ?? '';
  cumpleanos = this.user?.cumpleanos ?? '';
  alergias = this.user?.alergias ?? '';
  saved = false;

  historial: ReservaUsuario[] = [];
  historialLoading = true;

  ngOnInit(): void {
    if (!this.user) return;

    const now = new Date();
    const fechaInicio = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    this.reservationService
      .listReservas({
        empresa: this.tenant.company,
        clienteUsuarioId: this.user.userId,
        fechaInicio: this.toIso(fechaInicio),
        fechaFin: this.toIso(now)
      })
      .subscribe({
        next: (reservas) => {
          const today = this.toIso(now);
          this.historial = reservas
            .filter((r) => r.citaDia < today)
            .sort((a, b) => b.citaDia.localeCompare(a.citaDia));
          this.historialLoading = false;
        },
        error: () => {
          this.historialLoading = false;
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

  guardarPreferencias(): void {
    this.auth.updateProfile({
      preferencias: this.preferencias,
      cumpleanos: this.cumpleanos,
      alergias: this.alergias
    });
    this.user = this.auth.currentUser;
    this.saved = true;
    setTimeout(() => (this.saved = false), 2000);
  }

  logout(): void {
    this.auth.logout();
    this.reservationService.reset();
    this.router.navigate(['/landing']);
  }
}
