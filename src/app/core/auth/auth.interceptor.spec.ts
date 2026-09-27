import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  function setup(session: object | null) {
    localStorage.clear();
    if (session) localStorage.setItem('inventory-admin.session', JSON.stringify(session));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  }

  it('adds the bearer token to API requests', () => {
    setup({ accessToken: 'abc', user: { id: 1, role: 'admin' } });
    http.get(`${environment.apiUrl}/products`).subscribe();
    const req = controller.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
  });

  it('does not leak the token to other hosts', () => {
    setup({ accessToken: 'abc', user: { id: 1, role: 'admin' } });
    http.get('https://example.com/data').subscribe();
    const req = controller.expectOne('https://example.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
  });

  it('sends no header when logged out', () => {
    setup(null);
    http.get(`${environment.apiUrl}/products`).subscribe();
    const req = controller.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.headers.has('Authorization')).toBe(false);
  });
});
