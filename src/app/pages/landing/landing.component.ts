import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';

const REVIEW_ROTATION_MS = 5000;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {
  private tenantService = inject(TenantService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  tenant = this.tenantService.tenant;

  lightboxIndex: number | null = null;
  reviewIndex = 0;
  private reviewTimer?: ReturnType<typeof setInterval>;

  mapsEmbedUrl!: SafeResourceUrl;

  ngOnInit(): void {
    const url = `https://www.google.com/maps?q=${encodeURIComponent(this.tenant.direccion)}&output=embed`;
    this.mapsEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.reviewTimer = setInterval(() => this.nextReview(), REVIEW_ROTATION_MS);
  }

  ngOnDestroy(): void {
    if (this.reviewTimer) clearInterval(this.reviewTimer);
  }

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

  get currentYear(): number {
    return new Date().getFullYear();
  }

  get stars(): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(this.tenant.rating));
  }

  get cartaPreview() {
    return this.tenant.carta
      .filter((categoria) => categoria.platos.length > 0)
      .slice(0, 3)
      .map((categoria) => ({ ...categoria.platos[0], imagen: categoria.imagen }));
  }

  get featuredOpinion() {
    return this.tenant.opiniones[this.reviewIndex];
  }

  nextReview(): void {
    this.reviewIndex = (this.reviewIndex + 1) % this.tenant.opiniones.length;
  }

  get mapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.tenant.direccion)}`;
  }

  get websiteUrl(): string {
    return `https://${this.tenant.website}`;
  }

  get whatsappUrl(): string {
    const digits = this.tenant.whatsapp.replace(/\D/g, '');
    return `https://wa.me/${digits}`;
  }

  get heroBackground(): string {
    return (
      `linear-gradient(100deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0) 65%), ` +
      `linear-gradient(0deg, rgba(0,0,0,0.55), rgba(0,0,0,0) 60%), ` +
      `url(${this.tenant.heroImage})`
    );
  }

  galleryBackground(img: string | undefined): string {
    const fallback = 'linear-gradient(135deg, var(--color-primary-subtle), var(--color-primary-light))';
    return img ? `url(${img}), ${fallback}` : fallback;
  }

  reservar(): void {
    this.router.navigate(['/reservar']);
  }
}
