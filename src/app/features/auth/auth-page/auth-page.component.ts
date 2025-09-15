import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmationResult } from '@angular/fire/auth';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss'
})
export class AuthPageComponent {
  phone = '';
  code = '';
  confirmation: ConfirmationResult | null = null;

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  async signInWithGoogle() {
    await this.authService.signInWithGoogle();
    this.router.navigateByUrl('/search');
  }

  async sendCode() {
    const verifier = this.authService.createRecaptchaVerifier('recaptcha-container');
    this.confirmation = await this.authService.sendPhoneCode(this.phone, verifier);
  }

  async confirmCode() {
    if (!this.confirmation) return;
    await this.authService.confirmPhoneCode(this.confirmation, this.code);
    this.router.navigateByUrl('/search');
  }
}
