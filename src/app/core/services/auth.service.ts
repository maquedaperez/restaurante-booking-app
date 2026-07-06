import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthRequest, ForgotRequest, GuestRegisterData, User } from '../models/user.model';
import { TenantConfig } from '../models/restaurant.model';

const STORAGE_KEY = 'restaurante_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private currentUserSubject = new BehaviorSubject<User | null>(this.readStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser?.token;
  }

  get token(): string | null {
    return this.currentUser?.token ?? null;
  }

  login(request: AuthRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiBaseUrl}/Users/authenticate`, request).pipe(
      tap((user) => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  forgotPassword(request: ForgotRequest): Observable<unknown> {
    return this.http.post(`${environment.apiBaseUrl}/Users/forgot`, request);
  }

  /**
   * Alta ligera al confirmar una reserva como invitado. No existe (todavía) un endpoint
   * real de alta de ClienteUsuario en ARTIBusiness, así que para la demo se guarda una
   * sesión local con los datos introducidos, igual que haría login() con la respuesta real.
   */
  registerGuest(data: GuestRegisterData, tenant: TenantConfig): void {
    const user: User = {
      token: 'guest-mock-token',
      expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      userFirstName: data.nombre,
      userLastName: data.apellidos,
      userEmail: data.email,
      userPhone: data.telefono,
      userBusinessUnitRelationship: tenant.businessUnit,
      userId: Date.now(),
      userCompany: String(tenant.company)
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  updateProfile(partial: Pick<User, 'preferencias' | 'cumpleanos' | 'alergias'>): void {
    if (!this.currentUser) return;
    const updated: User = { ...this.currentUser, ...partial };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    this.currentUserSubject.next(updated);
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  private readStoredUser(): User | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
