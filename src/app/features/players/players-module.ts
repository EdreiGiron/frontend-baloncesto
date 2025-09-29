import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ListaComponent } from './lista/lista';
import { FormularioComponent } from './formulario/formulario';
import { playersRoutes } from './players-routing-module';

@NgModule({
  declarations: [ListaComponent, FormularioComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(playersRoutes),
  ],
})
export class PlayersModule {}