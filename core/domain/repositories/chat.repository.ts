import { ChatMessageEntity, ChatResponseEntity } from '../entities/chat.entity';

export interface ChatRepository {
  sendMessage(history: ChatMessageEntity[]): Promise<ChatResponseEntity>;
}