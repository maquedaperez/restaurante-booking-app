import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  template: `
    <div class="splash">
      <img src="assets/images/splash-brand.png" alt="ARTI Restaurant" class="splash__brand" />
    </div>
  `,
  styles: [
    `
      .splash {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-bg-card);
        animation: fadeIn 0.4s ease;
      }
      .splash__brand {
        width: 90vw;
        max-width: 1600px;
        height: auto;
        animation: fadeInUp 0.6s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `
  ]
})
export class SplashComponent implements OnInit {
  private router = inject(Router);

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/landing'], { replaceUrl: true });
    }, 2000);
  }
}
