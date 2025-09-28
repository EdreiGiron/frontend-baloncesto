import { Routes } from '@angular/router';

export const routes: Routes = [

  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent),
  },

  {
    path: 'display',
    loadComponent: () =>
      import('./features/display/display').then(m => m.DisplayComponent),
  },
  {
    path: 'control',
    loadComponent: () =>
      import('./features/control/control-panel/control-panel')
        .then(m => m.ControlPanelComponent),
  },
  {
    path: 'players',
    loadChildren: () =>
      import('./features/players/players-module').then(m => m.PlayersModule),
  },

  // 👇 esta siempre va al final
  { path: '**', redirectTo: 'display' },
];
