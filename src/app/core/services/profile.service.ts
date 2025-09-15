import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs, docData, orderBy, limit } from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  displayName: string;
  age?: number;
  city?: string; // Dakar, Thiès, etc.
  religion?: string; // ex: Islam, Chrétien
  bio?: string;
  photoUrl?: string;
  interests?: string[];
  location?: { lat: number; lng: number };
  verified?: boolean;
  createdAt: number;
  updatedAt: number;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private firestore = inject(Firestore);

  async upsertProfile(profile: UserProfile): Promise<void> {
    const ref = doc(this.firestore, 'profiles', profile.uid);
    const now = Date.now();
    const payload = { ...profile, updatedAt: now, createdAt: profile.createdAt ?? now };
    await setDoc(ref, payload, { merge: true });
  }

  async getProfile(uid: string): Promise<UserProfile | undefined> {
    const ref = doc(this.firestore, 'profiles', uid);
    const snap = await getDoc(ref);
    return (snap.exists() ? (snap.data() as UserProfile) : undefined);
  }

  watchProfile(uid: string): Observable<UserProfile | undefined> {
    const ref = doc(this.firestore, 'profiles', uid);
    return docData(ref) as Observable<UserProfile | undefined>;
  }

  async search(city?: string, filters?: { minAge?: number; maxAge?: number; religion?: string; name?: string }) {
    let q;
    if (city && city.trim()) {
      q = query(collection(this.firestore, 'profiles'), where('city', '==', city.trim()));
    } else {
      q = query(collection(this.firestore, 'profiles'), orderBy('createdAt', 'desc'), limit(50));
    }
    const results = await getDocs(q);
    let items = results.docs.map(d => d.data() as UserProfile);
    // Client-side filters for MVP
    if (filters?.minAge) items = items.filter(p => (p.age ?? 0) >= filters.minAge!);
    if (filters?.maxAge) items = items.filter(p => (p.age ?? 999) <= filters.maxAge!);
    if (filters?.religion) items = items.filter(p => p.religion === filters.religion);
    if (filters?.name && filters.name.trim()) {
      const needle = filters.name.trim().toLowerCase();
      items = items.filter(p => (p.displayName || '').toLowerCase().includes(needle));
    }
    return items;
  }
}


