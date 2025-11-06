import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { DashboardPage } from './dashboard.page'; // <-- 1. IMPORTA TU PÁGINA

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    LeafletModule
  ], 
})
export class DashboardPageModule {}