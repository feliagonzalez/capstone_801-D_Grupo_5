import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const canActivateAuth: CanActivateFn = () => {
  const router = inject(Router);
  const isLogged = !!localStorage.getItem('auth');
  if (!isLogged) {
    router.navigateByUrl('/login');
    return false;
  }
  return true;
};
