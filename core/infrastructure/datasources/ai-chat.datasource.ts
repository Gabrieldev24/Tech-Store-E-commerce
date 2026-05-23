import { prisma } from '@/lib/data/postgres';
import { ChatDatasource } from '../../domain/datasources/chat.datasource';
import { ChatMessageEntity, ChatResponseEntity } from '../../domain/entities/chat.entity';


export class AiChatDatasourceImpl implements ChatDatasource {
  
  async sendMessage(history: ChatMessageEntity[]): Promise<ChatResponseEntity> {
    //  Leemos la llave de Groq desde el archivo .env
    const apiKey = process.env.GEMINI_API_KEY; 
      
    if (!apiKey) {
      console.error(" ERROR: No se encontró la GROQ_API_KEY en el archivo .env");
      return new ChatResponseEntity("Error interno: Falta la llave de configuración.");
    }

    try {
      // 1. Jalamos los productos de la base de datos de Postgres usando Prisma
      const availableProducts = await prisma.product.findMany({
        select: { id: true, name: true, price: true, stock: true, category: true,image: true } 
      });

      // En lugar de pasar el JSON crudo, lo mapeamos a texto a prueba de tontos:
// 1. Catálogo súper limpio y directo (sin la palabra ID_EXACTO que la confundía)
      const catalogoParaLaIA = availableProducts.map(p => 
        `id: ${p.id} | nombre: ${p.name} | precio: ${p.price} | imagen: ${p.image}`
      ).join('\n');

      // 2. Prompt híbrido: Reglas estrictas + Ejemplo visual infalible
const systemPrompt = `Eres TechBot, el asistente virtual experto de nuestra tienda "TechStore".
    
    CATÁLOGO ACTUAL DE PRODUCTOS EN STOCK:
    ${catalogoParaLaIA}

    REGLAS ESTRICTAS DE COMPORTAMIENTO:
    1. BREVEDAD EXTREMA (LEY DE ORO): Tus respuestas NUNCA deben superar las 2 o 3 líneas, SIN EXCEPCIONES. Resume todo al máximo. Trata de decir siempre "En nuestro catálogo" cuando recomiendes algo.
    2. NOMBRES AMIGABLES: Transforma los nombres técnicos a nombres conversacionales y atractivos.
    3. RECOMENDACIONES RÁPIDAS: Si piden una recomendación, ofrece máximo 2 opciones cortas.
    4. PRECIOS Y MONEDA: NO menciones los precios en el texto a menos que te pregunten. Si lo haces, usa "S/".
    5. CERO MARKDOWN: Está ESTRICTAMENTE PROHIBIDO usar formato Markdown (nada de asteriscos **, ni #, NI LISTAS, NI VIÑETAS). Escribe todo en párrafos normales. Usa SOLO texto plano conversacional con emojis (🎧, 💻, 🖱️).
    6. CONOCIMIENTO EXTERNO Y STOCK: SOLO puedes vender lo que esté en el catálogo.
    7. TARJETAS DE PRODUCTO (VITAL): Si recomiendas un producto, DEBES incluir obligatoriamente al final de tu mensaje este código. El "id" debe ser el número EXACTO que aparece en el catálogo de arriba, ¡PROHIBIDO INVENTAR! El precio debe ser solo el número. NUNCA escribas el "id" dentro de tu texto hablado.
    [TARJETA | id | nombre | precio | imagen]
    
    EJEMPLO DE RESPUESTA PERFECTA PARA 2 PRODUCTOS (Copia esta estructura exacta):
    ¡Claro! 🎧 En nuestro catálogo tengo estas dos opciones increíbles para ti:
    [TARJETA | 13 | Power Bank UGREEN 25000mAh | 199.90 | https://url-imagen.jpg]
    [TARJETA | 1 | Audífonos Sony WH-CH520 | 159.00 | https://url-imagen.jpg]`;
    
    
      // 3. Mapeamos el historial al formato estándar que comparte Groq y OpenAI
      const formattedMessages = [
        { role: "system", content: systemPrompt },
        ...history.map(msg => ({
          role: msg.role === 'bot' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      // 4. Hacemos el fetch a los servidores de Groq
      const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}` // Enviamos la API Key de Groq
        },
        body: JSON.stringify({
          // Puedes cambiarlo por "openai/gpt-oss-120b" si quieres probar el de tu doc
          model: "meta-llama/llama-4-scout-17b-16e-instruct", 
          messages: formattedMessages,
          temperature: 0.7
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("🚨 Error crudo devuelto por Groq:", data);
        return new ChatResponseEntity("Uy, mi servidor central rechazó la conexión. Revisa la consola.");
      }

      // 5. Extraemos la respuesta del JSON y la enviamos al frontend
      const responseText = data.choices[0].message.content;
      return new ChatResponseEntity(responseText);
      
    } catch (error) {
      console.error("🚨 Error fatal en el bloque fetch:", error);
      return new ChatResponseEntity("Uy, tuve un problema de conexión con la red.");
    }
  }
}