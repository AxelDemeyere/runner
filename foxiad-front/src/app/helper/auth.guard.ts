import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {TokenService} from "../core/services/token/token.service";


export const AuthGuard = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.isLogged()) {
    return true;
  }
  return router.navigate(['/login']);
};
