import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { Login } from './login';

describe('Login', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();
  });

  it('fills the demo credentials and submits them', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    const demoButtons = element.querySelectorAll<HTMLButtonElement>('.demo button');
    demoButtons[0].click();
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.body).toEqual({ email: 'admin@inventory.dev', password: 'admin123' });
  });

  it('does not submit an invalid form', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    TestBed.inject(HttpTestingController).expectNone(`${environment.apiUrl}/auth/login`);
  });
});
