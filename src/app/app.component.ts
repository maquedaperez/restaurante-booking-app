import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, BottomNavComponent, NgIf],
  template: `
    <app-header *ngIf="router.url !== '/splash'"></app-header>
    <main class="app-shell">
      <router-outlet></router-outlet>
    </main>
    <app-bottom-nav *ngIf="router.url !== '/splash'"></app-bottom-nav>
  `,
  styles: [
    `
      .app-shell {
        min-height: 100vh;
      }
      @media (max-width: 720px) {
        .app-shell {
          padding-bottom: 64px;
        }
      }
    `
  ]
})
export class AppComponent {
  router = inject(Router);
}
