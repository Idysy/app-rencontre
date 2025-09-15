import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './core/services/auth.service';
import { ProfileService } from './core/services/profile.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'connect-sn';

  constructor(private readonly authService: AuthService, private readonly profileService: ProfileService) {}

  ngOnInit(): void {
    this.authService.authState$.subscribe(async (user) => {
      if (!user) return;
      // Auto-crée un profil minimal s'il n'existe pas encore
      const existing = await this.profileService.getProfile(user.uid);
      if (!existing) {
        await this.profileService.upsertProfile({
          uid: user.uid,
          displayName: user.displayName || 'Utilisateur',
          photoUrl: user.photoURL || undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          verified: false,
          interests: []
        });
      }
    });
  }
}
