import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, User, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  authState$ = new Observable<User | null>((subscriber) => {
    return onAuthStateChanged(this.auth, (user) => subscriber.next(user), (err) => subscriber.error(err), () => subscriber.complete());
  });

  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);
    return cred.user;
  }

  createRecaptchaVerifier(containerId: string): RecaptchaVerifier {
    return new RecaptchaVerifier(this.auth, containerId, { size: 'invisible' });
  }

  async sendPhoneCode(phoneE164: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    return signInWithPhoneNumber(this.auth, phoneE164, verifier);
  }

  async confirmPhoneCode(confirmation: ConfirmationResult, code: string): Promise<User> {
    const cred = await confirmation.confirm(code);
    return cred.user;
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }
}


