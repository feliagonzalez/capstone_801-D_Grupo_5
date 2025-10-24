import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// 1. ❌ ELIMINAR ESTA LÍNEA: import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    // 2. ⬇️ REEMPLAZAR 'component' con 'loadComponent'
    loadComponent: () => import('./home.page').then(m => m.HomePage),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}