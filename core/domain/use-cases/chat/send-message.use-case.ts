import { ChatRepository } from '../../repositories/chat.repository';
import { ChatMessageEntity, ChatResponseEntity } from '../../entities/chat.entity';

export class SendChatMessage {
  constructor(private readonly repository: ChatRepository) {}

  public async execute(history: ChatMessageEntity[]): Promise<ChatResponseEntity> {
    return await this.repository.sendMessage(history);
  }
}