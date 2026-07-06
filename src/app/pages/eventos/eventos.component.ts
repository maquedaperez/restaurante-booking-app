import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="eventos">
      <button class="eventos__back" (click)="back()">
        <span class="material-icons-round">arrow_back</span>
        Volver
      </button>

      <h1 class="eventos__title">Eventos</h1>

      <div class="eventos__empty" *ngIf="tenant.eventos.length === 0">
        <span class="material-icons-round">event_busy</span>
        <p>No hay eventos programados por ahora.</p>
      </div>

      <div class="evento-card" *ngFor="let evento of tenant.eventos">
        <span class="material-icons-round">celebration</span>
        <div>
          <h3>{{ evento.nombre }}</h3>
          <p class="evento-card__fecha">{{ evento.fecha }}</p>
          <p>{{ evento.descripcion }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .eventos {
        max-width: 640px;
        margin: 0 auto;
        padding: 24px 24px 80px;
      }
      .eventos__back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        color: var(--color-text-muted);
        font-size: 0.85rem;
        cursor: pointer;
        margin-bottom: 16px;
        padding: 4px 0;
      }
      .eventos__title {
        font-family: var(--font-display);
        font-size: 1.6rem;
        margin-bottom: 24px;
      }
      .eventos__empty {
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
      .evento-card {
        display: flex;
        gap: 16px;
        background: var(--color-bg-card);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
        padding: 18px;
        margin-bottom: 14px;

        > .material-icons-round {
          color: var(--color-primary);
          font-size: 28px;
        }
        h3 {
          font-size: 1rem;
          margin-bottom: 4px;
        }
        p {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
      }
      .evento-card__fecha {
        color: var(--color-primary) !important;
        font-weight: 500;
        margin-bottom: 4px;
      }
    `
  ]
})
export class EventosComponent {
  private tenantService = inject(TenantService);
  private router = inject(Router);

  tenant = this.tenantService.tenant;

  back(): void {
    this.router.navigate(['/landing']);
  }
}
