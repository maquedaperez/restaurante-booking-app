import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  private sanitizer = inject(DomSanitizer);

  tenant = this.tenantService.tenant;

  lightboxIndex: number | null = null;

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.lightboxIndex === null) return;
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowRight') this.nextImage();
    if (event.key === 'ArrowLeft') this.prevImage();
  }

  openLightbox(index: number): void {
    this.lightboxIndex = index;
  }

  closeLightbox(): void {
    this.lightboxIndex = null;
  }

  nextImage(): void {
    if (this.lightboxIndex === null) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.tenant.galleryImages.length;
  }

  prevImage(): void {
    if (this.lightboxIndex === null) return;
    const length = this.tenant.galleryImages.length;
    this.lightboxIndex = (this.lightboxIndex - 1 + length) % length;
  }

  get stars(): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(this.tenant.rating));
  }

  get cartaPreview() {
    return this.tenant.carta.flatMap((c) => c.platos).slice(0, 3);
  }

  get mapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.tenant.direccion)}`;
  }

  get mapsEmbedUrl(): SafeResourceUrl {
    const url = `https://www.google.com/maps?q=${encodeURIComponent(this.tenant.direccion)}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  get whatsappUrl(): string {
    const digits = this.tenant.whatsapp.replace(/\D/g, '');
    return `https://wa.me/${digits}`;
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
