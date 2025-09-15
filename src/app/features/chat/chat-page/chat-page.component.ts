import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { ChatService, ChatMessage, ChatSummary } from '../../../core/services/chat.service';
import { ProfileService, UserProfile } from '../../../core/services/profile.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatListModule, MatCardModule],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss'
})
export class ChatPageComponent {
  myChats: ChatSummary[] = [];
  matches: UserProfile[] = [];
  selectedChatId: string | null = null;
  messages: ChatMessage[] = [];
  composeText = '';
  searchUserCity = '';

  constructor(
    private readonly chatService: ChatService,
    private readonly profileService: ProfileService,
    private readonly auth: Auth
  ) {}

  async ngOnInit() {
    // Watch my chats
    try {
      this.chatService.watchMyChats().subscribe((list) => this.myChats = list);
    } catch {}
  }

  async findUsersByCity() {
    const city = this.searchUserCity || 'Dakar';
    this.matches = await this.profileService.search(city);
  }

  async openChatWith(user: UserProfile) {
    const chatId = await this.chatService.openOrCreateChatWith(user.uid);
    this.selectChat(chatId);
  }

  selectChat(chatId: string) {
    this.selectedChatId = chatId;
    this.chatService.watchMessages(chatId).subscribe((msgs) => this.messages = msgs);
  }

  async send() {
    if (!this.selectedChatId || !this.composeText.trim()) return;
    await this.chatService.sendMessage(this.selectedChatId, this.composeText.trim());
    this.composeText = '';
  }
}
