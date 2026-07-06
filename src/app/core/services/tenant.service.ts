import { Injectable } from '@angular/core';
import { TenantConfig } from '../models/restaurant.model';

const TENANTS: Record<string, TenantConfig> = {
  restaurantetheme: {
    company: 99,
    businessUnit: 200,
    theme: 'restaurantetheme',
    name: 'Casa Manolo',
    logoUrl: 'assets/images/logo.svg',
    primaryColor: '#c0392b',
    primaryDark: '#a93226',
    primaryLight: '#e74c3c',
    primarySubtle: '#fadbd8',
    accentColor: '#e67e22',
    heroImage: 'assets/images/hero.jpg',
    galleryImages: [
      'assets/images/gallery-1.jpg',
      'assets/images/gallery-2.jpg',
      'assets/images/gallery-3.jpg',
      'assets/images/gallery-4.jpg'
    ],
    rating: 4.7,
    direccion: 'Calle Mayor 12, Madrid',
    telefonoContacto: '910 000 000',
    carta: [
      {
        categoria: 'Entrantes',
        platos: [
          { nombre: 'Croquetas de jamón ibérico', descripcion: 'Cremosas, hechas a diario', precio: 9.5 },
          { nombre: 'Ensalada de burrata', descripcion: 'Tomate rosa, albahaca y aceite de oliva virgen', precio: 12 },
          { nombre: 'Carpaccio de ternera', descripcion: 'Con parmesano y rúcula', precio: 14 }
        ]
      },
      {
        categoria: 'Principales',
        platos: [
          { nombre: 'Solomillo a la parrilla', descripcion: 'Con patatas confitadas', precio: 22 },
          { nombre: 'Risotto de setas', descripcion: 'Setas de temporada y trufa', precio: 17 },
          { nombre: 'Lubina a la sal', descripcion: 'Con verduras de temporada', precio: 19.5 }
        ]
      },
      {
        categoria: 'Postres',
        platos: [
          { nombre: 'Tarta de queso', descripcion: 'Receta de la casa', precio: 6.5 },
          { nombre: 'Coulant de chocolate', descripcion: 'Con helado de vainilla', precio: 7 }
        ]
      }
    ],
    menusEspeciales: [
      {
        nombre: 'Menú Degustación',
        descripcion: '5 platos maridados con nuestra selección de vinos',
        precio: 45
      },
      {
        nombre: 'Menú Celebración',
        descripcion: 'Ideal para grupos y ocasiones especiales, incluye entrante, principal y postre a elegir',
        precio: 35
      }
    ],
    opiniones: [
      { autor: 'Laura M.', texto: 'Trato excelente y comida espectacular. Repetiremos seguro.', rating: 5 },
      { autor: 'Carlos R.', texto: 'La terraza tiene un ambiente inmejorable. Muy recomendable.', rating: 5 },
      { autor: 'Marta S.', texto: 'Buena relación calidad-precio, el menú degustación merece la pena.', rating: 4 }
    ],
    eventos: [
      { nombre: 'Noche de Jazz en directo', fecha: '2026-07-18', descripcion: 'Cena con música en vivo en la terraza' },
      { nombre: 'Maridaje de vinos de la Ribera', fecha: '2026-07-25', descripcion: 'Cata guiada con nuestro sumiller' }
    ]
  }
};

const DOMAIN_MAP: Record<string, string> = {
  localhost: 'restaurantetheme'
};

@Injectable({ providedIn: 'root' })
export class TenantService {
  private currentTenant: TenantConfig;

  constructor() {
    this.currentTenant = this.resolveTenant();
    this.applyTheme(this.currentTenant);
  }

  get tenant(): TenantConfig {
    return this.currentTenant;
  }

  private resolveTenant(): TenantConfig {
    const hostname = window.location.hostname;
    const themeKey = DOMAIN_MAP[hostname] ?? 'restaurantetheme';
    return TENANTS[themeKey] ?? TENANTS['restaurantetheme'];
  }

  private applyTheme(tenant: TenantConfig): void {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', tenant.primaryColor);
    root.style.setProperty('--color-primary-dark', tenant.primaryDark);
    root.style.setProperty('--color-primary-light', tenant.primaryLight);
    root.style.setProperty('--color-primary-subtle', tenant.primarySubtle);
    root.style.setProperty('--color-accent', tenant.accentColor);
  }
}
