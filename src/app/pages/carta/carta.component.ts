import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';

@Component({
  selector: 'app-carta',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="carta">
      <button class="carta__back" (click)="back()">
        <span class="material-icons-round">arrow_back</span>
        Volver
      </button>

      <h1 class="carta__title">Nuestra Carta</h1>

      <section class="carta__category" *ngFor="let categoria of tenant.carta">
        <h2>{{ categoria.categoria }}</h2>
        <div class="carta__item" *ngFor="let plato of categoria.platos">
          <div>
            <h3>{{ plato.nombre }}</h3>
            <p>{{ plato.descripcion }}</p>
          </div>
          <span class="carta__price">{{ plato.precio.toFixed(2) }} €</span>
        </div>
      </section>

      <section class="carta__category">
        <h2>Menús Especiales</h2>
        <div class="carta__item" *ngFor="let menu of tenant.menusEspeciales">
          <div>
            <h3>{{ menu.nombre }}</h3>
            <p>{{ menu.descripcion }}</p>
          </div>
          <span class="carta__price">{{ menu.precio.toFixed(2) }} €</span>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .carta {
        max-width: 720px;
        margin: 0 auto;
        padding: 24px 24px 80px;
      }
      .carta__back {
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
      .carta__title {
        font-family: var(--font-display);
        font-size: 1.6rem;
        margin-bottom: 24px;
      }
      .carta__category {
        margin-bottom: 32px;

        h2 {
          font-family: var(--font-display);
          font-size: 1.15rem;
          color: var(--color-primary);
          margin-bottom: 12px;
        }
      }
      .carta__item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 0;
        border-bottom: 1px solid var(--color-border);

        h3 {
          font-size: 0.95rem;
          margin-bottom: 4px;
        }
        p {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
      }
      .carta__price {
        font-weight: 600;
        color: var(--color-primary);
        white-space: nowrap;
      }
    `
  ]
})
export class CartaComponent {
  private tenantService = inject(TenantService);
  private router = inject(Router);

  tenant = this.tenantService.tenant;

  back(): void {
    this.router.navigate(['/landing']);
  }
}
