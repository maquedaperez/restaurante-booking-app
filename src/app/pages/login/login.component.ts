import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private tenantService = inject(TenantService);

  tenant = this.tenantService.tenant;

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  submit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Introduce tu email y contraseña.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.auth
      .login({
        company: this.tenant.company,
        businessUnit: this.tenant.businessUnit,
        username: this.email,
        password: this.password,
        theme: this.tenant.theme,
        validationCode: ''
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/landing']);
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Email o contraseña incorrectos. Inténtalo de nuevo.';
        }
      });
  }
}
