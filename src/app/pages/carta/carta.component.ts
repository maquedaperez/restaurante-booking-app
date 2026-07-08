import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';

@Component({
  selector: 'app-carta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carta.component.html',
  styleUrl: './carta.component.scss'
})
export class CartaComponent {
  private tenantService = inject(TenantService);
  private router = inject(Router);

  tenant = this.tenantService.tenant;

  categoryImage(img: string | undefined): string {
    const fallback = 'linear-gradient(135deg, var(--color-primary-subtle), var(--color-primary-light))';
    return img ? `url(${img}), ${fallback}` : fallback;
  }

  back(): void {
    this.router.navigate(['/landing']);
  }
}
