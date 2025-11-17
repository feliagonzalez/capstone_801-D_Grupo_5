import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearpozoPageRoutingModule } from './crearpozo-routing.module';

import { CrearpozoPage } from './crearpozo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearpozoPageRoutingModule
  ],
  
  
})
export class CrearpozoPageModule {}
