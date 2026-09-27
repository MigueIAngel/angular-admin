import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('starts unauthenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
  });

  it('stores the session after login and exposes the role', () => {
    service.login('admin@inventory.dev', 'admin123').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.body).toEqual({ email: 'admin@inventory.dev', password: 'admin123' });
    req.flush({
      accessToken: 'jwt-token',
      user: { id: 1, email: 'admin@inventory.dev', name: 'Admin', role: 'admin' },
    });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);
    expect(service.token()).toBe('jwt-token');
    expect(localStorage.getItem('inventory-admin.session')).toContain('jwt-token');
  });

  it('clears the session on logout', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    service.login('staff@inventory.dev', 'staff123').subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({
      accessToken: 't',
      user: { id: 2, email: 'staff@inventory.dev', name: 'Staff', role: 'staff' },
    });

    expect(service.isAdmin()).toBe(false);
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('inventory-admin.session')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
