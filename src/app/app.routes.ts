import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.component').then((m) => m.SplashComponent)
  },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent)
  },
  {
    path: 'carta',
    loadComponent: () => import('./pages/carta/carta.component').then((m) => m.CartaComponent)
  },
  {
    path: 'eventos',
    loadComponent: () => import('./pages/eventos/eventos.component').then((m) => m.EventosComponent)
  },
  {
    path: 'reservar',
    loadComponent: () => import('./pages/reservar/reservar.component').then((m) => m.ReservarComponent)
  },
  {
    path: 'confirmation',
    loadComponent: () =>
      import('./pages/booking-confirmation/booking-confirmation.component').then(
        (m) => m.BookingConfirmationComponent
      )
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent)
  },
  {
    path: 'my-reservations',
    loadComponent: () =>
      import('./pages/my-reservations/my-reservations.component').then((m) => m.MyReservationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'landing' }
];
