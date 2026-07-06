import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="forgot">
      <div class="forgot__card">
        <h1 class="forgot__title">Recuperar contraseña</h1>

        <ng-container *ngIf="!sent; else successTpl">
          <p class="forgot__subtitle">Introduce tu email y te enviaremos instrucciones.</p>
          <form (ngSubmit)="submit()" class="forgot__form">
            <input
              type="email"
              class="form-control"
              name="email"
              [(ngModel)]="email"
              placeholder="tu@email.com"
              autocomplete="username"
            />
            <p class="forgot__error" *ngIf="errorMessage">{{ errorMessage }}</p>
            <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
              <span *ngIf="!loading">Enviar</span>
              <span *ngIf="loading" class="spinner-sm"></span>
            </button>
          </form>
        </ng-container>

        <ng-template #successTpl>
          <p class="forgot__success">
            <span class="material-icons-round">check_circle</span>
            Te hemos enviado un email con instrucciones para restablecer tu contraseña.
          </p>
        </ng-template>

        <a routerLink="/login" class="forgot__back">Volver al inicio de sesión</a>
      </div>
    </div>
  `,
  styles: [
    `
      .forgot {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: linear-gradient(160deg, var(--color-primary-subtle), var(--color-bg));
      }
      .forgot__card {
        width: 100%;
        max-width: 380px;
        background: var(--color-bg-card);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: 40px 32px;
        text-align: center;
      }
      .forgot__title {
        font-family: var(--font-display);
        font-size: 1.4rem;
        margin-bottom: 8px;
      }
      .forgot__subtitle {
        color: var(--color-text-muted);
        font-size: 0.9rem;
        margin-bottom: 20px;
      }
      .forgot__form {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .forgot__error {
        color: var(--color-error);
        font-size: 0.85rem;
        margin: -4px 0 0;
        text-align: left;
      }
      .forgot__success {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: var(--color-success);
        font-size: 0.95rem;
        margin: 12px 0 8px;

        .material-icons-round {
          font-size: 40px;
        }
      }
      .forgot__back {
        display: inline-block;
        margin-top: 20px;
        font-size: 0.85rem;
        color: var(--color-primary);
        text-decoration: none;
      }
      .forgot__back:hover {
        text-decoration: underline;
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
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private tenantService = inject(TenantService);

  tenant = this.tenantService.tenant;
  email = '';
  loading = false;
  sent = false;
  errorMessage = '';

  submit(): void {
    if (!this.email) {
      this.errorMessage = 'Introduce tu email.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.auth
      .forgotPassword({
        company: this.tenant.company,
        businessUnit: this.tenant.businessUnit,
        username: this.email,
        password: '',
        theme: this.tenant.theme,
        validationCode: ''
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.sent = true;
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'No hemos podido procesar tu solicitud. Inténtalo de nuevo.';
        }
      });
  }
}
