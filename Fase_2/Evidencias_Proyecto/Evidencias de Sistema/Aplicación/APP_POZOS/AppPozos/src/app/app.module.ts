import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

// 👇 Importa el standalone AppComponent
import { AppComponent } from './app.component';

// Si tienes AppRoutingModule, déjalo igual:
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  // 👇 NO declares AppComponent (porque es standalone)
  declarations: [],
  // 👇 Importa AppComponent y demás módulos
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AppComponent, // <- Importar el standalone aquí
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  // 👇 Sí puede ir en bootstrap
  bootstrap: [AppComponent],
})
export class AppModule {}
