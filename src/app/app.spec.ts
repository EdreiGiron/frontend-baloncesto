import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app';
import { AuthService } from './core/auth.service';

class AuthStub {
  isLoggedIn() { return true; }
  getRole()    { return 'Admin'; }
  getUsername(){ return 'Tester'; }
  logout() {}
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),                 // router mínimo para RouterLink/Outlet
        { provide: AuthService, useClass: AuthStub }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
