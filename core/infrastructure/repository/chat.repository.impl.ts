import { ChatRepository } from '../../domain/repositories/chat.repository';
import { ChatDatasource } from '../../domain/datasources/chat.datasource';
import { ChatMessageEntity, ChatResponseEntity } from '../../domain/entities/chat.entity';

export class ChatRepositoryImpl implements ChatRepository {
  constructor(private readonly datasource: ChatDatasource) {}

  sendMessage(history: ChatMessageEntity[]): Promise<ChatResponseEntity> {
    return this.datasource.sendMessage(history);
  }
}