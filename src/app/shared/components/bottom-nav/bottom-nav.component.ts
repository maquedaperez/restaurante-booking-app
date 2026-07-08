import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe, NgIf],
  template: `
    <nav class="bottom-nav">
      <a class="bottom-nav__item" routerLink="/landing" routerLinkActive="bottom-nav__item--active">
        <span class="material-icons-round">home</span>
        <span>Inicio</span>
      </a>

      <ng-container *ngIf="auth.currentUser$ | async; else guestNav">
        <a class="bottom-nav__item" routerLink="/my-reservations" routerLinkActive="bottom-nav__item--active">
          <span class="material-icons-round">event_note</span>
          <span>Mis Reservas</span>
        </a>
        <a class="bottom-nav__item" routerLink="/carta" routerLinkActive="bottom-nav__item--active">
          <span class="material-icons-round">restaurant_menu</span>
          <span>Carta</span>
        </a>
        <a class="bottom-nav__item" routerLink="/eventos" routerLinkActive="bottom-nav__item--active">
          <span class="material-icons-round">celebration</span>
          <span>Eventos</span>
        </a>
      </ng-container>

      <ng-template #guestNav>
        <a class="bottom-nav__item" routerLink="/reservar" routerLinkActive="bottom-nav__item--active">
          <span class="material-icons-round">event_note</span>
          <span>Reservas</span>
        </a>
        <a class="bottom-nav__item" routerLink="/carta" routerLinkActive="bottom-nav__item--active">
          <span class="material-icons-round">restaurant_menu</span>
          <span>Carta</span>
        </a>
      </ng-template>

      <a class="bottom-nav__item" routerLink="/profile" routerLinkActive="bottom-nav__item--active">
        <span class="material-icons-round">person</span>
        <span>Perfil</span>
      </a>
    </nav>
  `,
  styles: [
    `
      .bottom-nav {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--color-bg-card);
        box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.08);
        z-index: 20;
        padding-bottom: env(safe-area-inset-bottom, 0);
      }
      .bottom-nav__item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 8px 4px 10px;
        text-decoration: none;
        color: var(--color-text-muted);
        font-size: 0.68rem;

        .material-icons-round {
          font-size: 22px;
        }
      }
      @media (min-width: 900px) {
        .bottom-nav__item {
          flex-direction: row;
          gap: 8px;
          padding: 16px 4px;
          font-size: 0.82rem;
          font-weight: 500;

          .material-icons-round {
            font-size: 20px;
          }
        }
      }
      .bottom-nav__item--active {
        color: var(--color-primary-dark);
        font-weight: 700;
      }
    `
  ]
})
export class BottomNavComponent {
  auth = inject(AuthService);
}
