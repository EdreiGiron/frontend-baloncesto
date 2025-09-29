import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchesRoutingModule } from './matches-routing-module';

import { ListaComponent } from './lista/lista';
import { FormularioComponent } from './formulario/formulario';
import { HistorialComponent } from './historial/historial';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatchesRoutingModule,
    ListaComponent,        // ✅ Importar standalone
    FormularioComponent,   // ✅ Importar standalone
    HistorialComponent     // ✅ Importar standalone
  ]
})
export class MatchesModule {}
