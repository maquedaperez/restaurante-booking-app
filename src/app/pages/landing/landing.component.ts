import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  private tenantService = inject(TenantService);
  private router = inject(Router);

  tenant = this.tenantService.tenant;

  get stars(): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(this.tenant.rating));
  }

  get cartaPreview() {
    return this.tenant.carta.flatMap((c) => c.platos).slice(0, 3);
  }

  get mapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.tenant.direccion)}`;
  }

  get heroBackground(): string {
    return `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.65)), url(${this.tenant.heroImage})`;
  }

  galleryBackground(img: string): string {
    return `url(${img}), linear-gradient(135deg, var(--color-primary-subtle), var(--color-primary-light))`;
  }

  reservar(): void {
    this.router.navigate(['/reservar']);
  }
}
