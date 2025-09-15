import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const user = auth.currentUser ?? await new Promise(resolve => {
    const unsub = auth.onAuthStateChanged(u => { resolve(u); unsub(); });
  });
  if (!user) {
    router.navigateByUrl('/auth');
    return false;
  }
  return true;
};


