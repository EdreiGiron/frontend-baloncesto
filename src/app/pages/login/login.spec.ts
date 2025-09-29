import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: Router, useValue: { navigate: () => {} } },
        { provide: AuthService, useValue: { login: () => of({ token: 'x' }), setToken: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
