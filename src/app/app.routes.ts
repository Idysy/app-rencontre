import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: 'auth', loadComponent: () => import('./features/auth/auth-page/auth-page.component').then(m => m.AuthPageComponent) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile-page/profile-page.component').then(m => m.ProfilePageComponent) },
  { path: 'search', canActivate: [authGuard], loadComponent: () => import('./features/search/search-page/search-page.component').then(m => m.SearchPageComponent) },
  { path: 'chat', canActivate: [authGuard], loadComponent: () => import('./features/chat/chat-page/chat-page.component').then(m => m.ChatPageComponent) },
  { path: 'premium', loadComponent: () => import('./features/premium/premium-page/premium-page.component').then(m => m.PremiumPageComponent) },
  { path: '**', redirectTo: 'search' }
];
