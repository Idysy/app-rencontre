import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MapsService {
  readonly apiKey = environment.googleMapsApiKey;

  getStaticMapUrl(lat: number, lng: number, zoom = 12, size = '600x300') {
    const base = 'https://maps.googleapis.com/maps/api/staticmap';
    const params = new URLSearchParams({
      center: `${lat},${lng}`,
      zoom: String(zoom),
      size,
      markers: `${lat},${lng}`,
      key: this.apiKey
    });
    return `${base}?${params.toString()}`;
  }
}


