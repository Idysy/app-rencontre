import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  DocumentReference,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface ChatSummary {
  chatId: string;
  participants: string[];
  lastMessageText?: string;
  lastMessageAt?: number;
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderUid: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private get userId(): string | undefined {
    return this.auth.currentUser?.uid;
  }

  // Ensure a userChats doc exists for a user
  private async ensureUserChats(uid: string): Promise<void> {
    const ref = doc(this.firestore, 'userChats', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { chatIds: [] });
    }
  }

  private participantsKey(uidA: string, uidB: string): string {
    return [uidA, uidB].sort().join('_');
  }

  async openOrCreateChatWith(otherUid: string): Promise<string> {
    const me = this.userId;
    if (!me) throw new Error('Not authenticated');
    await this.ensureUserChats(me);
    await this.ensureUserChats(otherUid);

    const key = this.participantsKey(me, otherUid);
    const chatMetaRef = doc(this.firestore, 'chatsMeta', key);
    const metaSnap = await getDoc(chatMetaRef);
    let chatId: string;
    if (!metaSnap.exists()) {
      // Create chat
      const chatsCol = collection(this.firestore, 'chats');
      const newChatRef: DocumentReference = await addDoc(chatsCol, {
        participants: [me, otherUid],
        createdAt: Date.now(),
        lastMessageText: '',
        lastMessageAt: Date.now(),
      });
      chatId = newChatRef.id;
      // store mapping so both users can access via rules
      await setDoc(chatMetaRef, { chatId, participants: [me, otherUid] });
      // Update userChats
      const meRef = doc(this.firestore, 'userChats', me);
      const otherRef = doc(this.firestore, 'userChats', otherUid);
      const meDoc = await getDoc(meRef);
      const otherDoc = await getDoc(otherRef);
      await updateDoc(meRef, { chatIds: [...(((meDoc.data() as any)?.['chatIds']) ?? []), chatId] });
      await updateDoc(otherRef, { chatIds: [...(((otherDoc.data() as any)?.['chatIds']) ?? []), chatId] });
    } else {
      chatId = metaSnap.data()['chatId'];
    }
    return chatId;
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    const me = this.userId;
    if (!me) throw new Error('Not authenticated');
    const messagesCol = collection(this.firestore, 'chats', chatId, 'messages');
    await addDoc(messagesCol, {
      text,
      senderUid: me,
      createdAt: Date.now(),
      createdAtServer: serverTimestamp(),
    });
    const chatRef = doc(this.firestore, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessageText: text,
      lastMessageAt: Date.now(),
    });
  }

  watchMessages(chatId: string): Observable<ChatMessage[]> {
    return new Observable((subscriber) => {
      const q = query(collection(this.firestore, 'chats', chatId, 'messages'), orderBy('createdAt'));
      const unsub = onSnapshot(q, (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ChatMessage[];
        subscriber.next(msgs);
      }, (err) => subscriber.error(err));
      return () => unsub();
    });
  }

  watchMyChats(): Observable<ChatSummary[]> {
    const me = this.userId;
    if (!me) throw new Error('Not authenticated');
    return new Observable((subscriber) => {
      const meRef = doc(this.firestore, 'userChats', me);
      const unsub = onSnapshot(meRef, async (snap) => {
        const chatIds: string[] = snap.data()?.['chatIds'] ?? [];
        // Fetch summaries in parallel
        const promises = chatIds.map(async (id) => {
          const ref = doc(this.firestore, 'chats', id);
          const chat = await getDoc(ref);
          const data = chat.data() as any;
          return {
            chatId: id,
            participants: data?.participants ?? [],
            lastMessageText: data?.lastMessageText ?? '',
            lastMessageAt: data?.lastMessageAt ?? 0,
          } as ChatSummary;
        });
        const results = await Promise.all(promises);
        subscriber.next(results);
      }, (err) => subscriber.error(err));
      return () => unsub();
    });
  }
}


