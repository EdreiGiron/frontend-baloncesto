import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DisplayComponent } from './features/display/display';
import { ControlPanelComponent } from './features/control/control-panel/control-panel';
import { TeamsListComponent } from './features/teams-list/teams-list';
import { ListaComponent } from './features/players/lista/lista';
import { FormularioComponent } from './features/players/formulario/formulario';
import { ListaComponent as MatchesListaComponent } from './features/matches/lista/lista';
import { FormularioComponent as MatchesFormularioComponent } from './features/matches/formulario/formulario';
import { HistorialComponent } from './features/matches/historial/historial';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'display', component: DisplayComponent, canActivate: [authGuard] },
  { path: 'control', component: ControlPanelComponent, canActivate: [adminGuard] },
  { path: 'equipos', component: TeamsListComponent, canActivate: [adminGuard] },

  // 👇 Jugadores
  { path: 'jugadores', component: ListaComponent, canActivate: [adminGuard] },
  { path: 'jugadores/nuevo', component: FormularioComponent, canActivate: [adminGuard] },
  { path: 'jugadores/editar/:id', component: FormularioComponent, canActivate: [adminGuard] },

  // 👇 Partidos (Matches)
  { path: 'partidos', component: MatchesListaComponent, canActivate: [adminGuard] },
  { path: 'partidos/nuevo', component: MatchesFormularioComponent, canActivate: [adminGuard] },
  { path: 'partidos/editar/:id', component: MatchesFormularioComponent, canActivate: [adminGuard] },
  { path: 'partidos/historial', component: HistorialComponent, canActivate: [authGuard] },

  { path: '', pathMatch: 'full', redirectTo: 'display' },
  { path: '**', redirectTo: 'display' },
];