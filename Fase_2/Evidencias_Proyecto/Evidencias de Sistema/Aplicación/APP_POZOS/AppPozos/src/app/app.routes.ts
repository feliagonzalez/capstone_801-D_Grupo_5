import { Routes } from '@angular/router';
import { canActivateAuth } from './auth.guard';

// 👇 OJO: tus carpetas son /app/login, /app/registro, /app/home (sin "pages")
import { LoginPage } from './login/login.page';
import { RegistroPage } from './registro/registro.page';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'registro', component: RegistroPage },
  { path: 'home', component: HomePage, canActivate: [canActivateAuth] },
];
