import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProfileService, UserProfile } from '../../../core/services/profile.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatSlideToggleModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent {
  model: Partial<UserProfile> = {};
  senegalCities: string[] = [
    'Dakar', 'Thiès', 'Mbour', 'Saint-Louis', 'Kaolack', 'Touba', 'Ziguinchor', 'Louga', 'Fatick', 'Kolda', 'Tambacounda'
  ];

  constructor(private readonly profileService: ProfileService, private readonly auth: Auth) {}

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) return;
    const existing = await this.profileService.getProfile(user.uid);
    if (existing) this.model = existing;
  }

  async save() {
    const user = this.auth.currentUser;
    if (!user) return;
    const payload: UserProfile = {
      uid: user.uid,
      displayName: this.model.displayName || user.displayName || 'Utilisateur',
      age: this.model.age,
      city: this.model.city,
      religion: this.model.religion,
      bio: this.model.bio,
      photoUrl: this.model.photoUrl || user.photoURL || undefined,
      interests: this.model.interests || [],
      location: this.model.location,
      verified: this.model.verified ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await this.profileService.upsertProfile(payload);
  }
}
