export class ChatMessageEntity {
  constructor(
    public role: 'user' | 'bot' | 'system',
    public content: string,
  ) {}
}

export class ChatResponseEntity {
  constructor(
    public response: string,
    public suggestedProducts?: any[] // Preparado para cuando la IA encuentre productos en tu BD
  ) {}
}