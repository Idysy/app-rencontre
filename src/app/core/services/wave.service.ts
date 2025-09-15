import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CreatePaymentRequest {
  amount: number;
  currency: string; // e.g., XOF
  phoneNumber: string; // Wave phone number
  description?: string;
}

export interface CreatePaymentResponse {
  id: string;
  status: 'pending' | 'success' | 'failed';
}

@Injectable({ providedIn: 'root' })
export class WaveService {
  private readonly apiBaseUrl = environment.waveApiBaseUrl;

  constructor(private readonly httpClient: HttpClient) {}

  createPayment(request: CreatePaymentRequest) {
    // Placeholder: integrate real Wave API endpoint when available
    return this.httpClient.post<CreatePaymentResponse>(`${this.apiBaseUrl}/payments`, request);
  }

  getPaymentStatus(paymentId: string) {
    return this.httpClient.get<CreatePaymentResponse>(`${this.apiBaseUrl}/payments/${paymentId}`);
  }
}


