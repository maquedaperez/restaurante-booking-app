import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgIf],
  template: `
    <header class="header">
      <a class="header__brand" routerLink="/landing">
        <img [src]="tenant.logoUrl" [alt]="tenant.name" class="header__logo" />
        <span class="header__name">{{ tenant.name }}</span>
      </a>
      <nav class="header__nav" *ngIf="auth.currentUser$ | async as user; else guestNav">
        <a class="header__link" routerLink="/my-reservations">
          <span class="material-icons-round">event_note</span>
          <span class="header__link-text">Mis reservas</span>
        </a>
        <a class="header__link" routerLink="/profile">
          <span class="material-icons-round">person</span>
          <span class="header__link-text">Perfil</span>
        </a>
        <button class="header__link header__link--btn" (click)="logout()">
          <span class="material-icons-round">logout</span>
          <span class="header__link-text">Salir</span>
        </button>
      </nav>
      <ng-template #guestNav>
        <nav class="header__nav">
          <a class="header__link" routerLink="/login">
            <span class="material-icons-round">login</span>
            <span class="header__link-text">Iniciar sesión</span>
          </a>
        </nav>
      </ng-template>
    </header>
  `,
  styles: [
    `
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        background: var(--color-bg-card);
        box-shadow: var(--shadow-sm);
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .header__brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: var(--color-text);
      }
      .header__logo {
        width: 36px;
        height: 36px;
        object-fit: contain;
        border-radius: var(--radius-sm);
      }
      .header__name {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 1.1rem;
      }
      .header__nav {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .header__link {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: var(--radius-sm);
        color: var(--color-text-secondary);
        text-decoration: none;
        font-size: 0.85rem;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: background var(--transition-fast);
      }
      .header__link:hover {
        background: var(--color-primary-subtle);
        color: var(--color-primary-dark);
      }
      @media (max-width: 560px) {
        .header__link-text {
          display: none;
        }
      }
      @media (max-width: 720px) {
        .header__nav {
          display: none;
        }
      }
    `
  ]
})
export class HeaderComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private tenantService = inject(TenantService);

  tenant = this.tenantService.tenant;

  logout(): void {
    this.auth.logout();
    this.reservationService.reset();
    this.router.navigate(['/landing']);
  }
}
