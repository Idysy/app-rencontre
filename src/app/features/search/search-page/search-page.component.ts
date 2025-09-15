import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ProfileService, UserProfile } from '../../../core/services/profile.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent {
  city = '';
  minAge?: number;
  maxAge?: number;
  religion?: string;
  name?: string;
  results: UserProfile[] = [];
  myUid?: string;

  constructor(private readonly profileService: ProfileService, private readonly auth: Auth) {}

  async ngOnInit() {
    this.myUid = this.auth.currentUser?.uid || undefined;
    await this.search();
  }

  async search() {
    const list = await this.profileService.search(this.city, {
      minAge: this.minAge,
      maxAge: this.maxAge,
      religion: this.religion,
      name: this.name
    });
    this.results = this.myUid ? list.filter(p => p.uid !== this.myUid) : list;
  }
}
