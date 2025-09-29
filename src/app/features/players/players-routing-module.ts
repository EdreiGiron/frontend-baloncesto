import { Routes } from '@angular/router';
import { ListaComponent } from './lista/lista';
import { FormularioComponent } from './formulario/formulario';

export const playersRoutes: Routes = [
  { path: '', component: ListaComponent },
  { path: 'nuevo', component: FormularioComponent },
  { path: 'editar/:id', component: FormularioComponent },
];
