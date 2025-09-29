import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaComponent } from './lista/lista';
import { FormularioComponent } from './formulario/formulario';
import { HistorialComponent } from './historial/historial';

const routes: Routes = [
  { path: '', component: ListaComponent },
  { path: 'nuevo', component: FormularioComponent },
  { path: 'editar/:id', component: FormularioComponent },
  { path: 'historial', component: HistorialComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MatchesRoutingModule {}
