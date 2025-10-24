import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

// ❌ Asegúrate de que no haya importación de HomePage aquí.

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  // ❌ NO DEBE HABER SECCIÓN 'declarations' AQUÍ.
})
export class HomePageModule {}