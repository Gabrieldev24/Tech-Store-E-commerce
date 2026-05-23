import { ChatMessageEntity, ChatResponseEntity } from '../entities/chat.entity';

export interface ChatDatasource {
  // Recibe todo el historial de la conversación para no perder el contexto
  sendMessage(history: ChatMessageEntity[]): Promise<ChatResponseEntity>;
}