import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'display', pathMatch: 'full' },

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

  { path: '**', redirectTo: 'display' },
];
