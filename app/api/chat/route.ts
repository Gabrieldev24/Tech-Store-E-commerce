import { NextResponse } from 'next/server';
import { AiChatDatasourceImpl } from '@/core/infrastructure/datasources/ai-chat.datasource';
import { SendChatMessage } from '@/core/domain/use-cases/chat/send-message.use-case';
import { ChatRepositoryImpl } from '@/core/infrastructure/repository/chat.repository.impl';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { history } = body; 

    if (!history || !Array.isArray(history)) {
      return NextResponse.json({ error: 'El historial es requerido' }, { status: 400 });
    }

    // 🔥 Aplicando Clean Architecture
    const datasource = new AiChatDatasourceImpl();
    const repository = new ChatRepositoryImpl(datasource);
    const useCase = new SendChatMessage(repository);

    // Ejecutamos el caso de uso
    const result = await useCase.execute(history);

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error en el endpoint de chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}