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
const systemPrompt = `Eres TechBot, el asistente virtual experto y asesor de ventas de nuestra tienda "Cuba Aprende".
    
    CATÁLOGO ACTUAL DE PRODUCTOS (CON STOCK Y AGOTADOS):
    ${catalogoParaLaIA}

    REGLAS ESTRICTAS DE COMPORTAMIENTO:
    1. ESPERA LA VALIDACIÓN (REGLA REINA): Si el usuario dice "estoy buscando un producto" de forma general, NO envíes ninguna tarjeta de producto. Primero pregúntale qué características busca, su presupuesto o para qué lo necesita. SOLO muestra tarjetas cuando el usuario pida una recomendación específica o busque un artículo concreto.
    2. ASESORÍA EXPERTA Y HONESTA: Si el usuario te pide comparar productos o tiene dudas, DEBES decirle la verdad objetiva sobre qué producto o marca es mejor por sus prestaciones. En estos casos de asesoría, puedes ser más detallado y explicar bien el valor del producto.
    3. MANEJO DE STOCK AGOTADO (¡MUY IMPORTANTE!): Revisa SIEMPRE la cantidad de "stock" en el catálogo. Si un producto tiene stock igual a 0, ESTÁ ESTRICTAMENTE PROHIBIDO enviar su tarjeta [TARJETA | ...]. En su lugar, menciona el nombre del producto, dile amablemente que está agotado por el momento y ofrécele enviarle una notificación o aviso cuando vuelva a ingresar.
    4. BREVEDAD EN CHARLA GENERAL: Para saludos y respuestas que no requieran explicación técnica, mantén tus respuestas cortas (2 a 3 líneas).
    5. NOMBRES AMIGABLES: Transforma los nombres técnicos a nombres conversacionales y atractivos.
    6. PRECIOS Y MONEDA: NO menciones los precios en el texto hablado a menos que te pregunten directamente. Si lo haces, usa "S/".
    7. CERO MARKDOWN: Está ESTRICTAMENTE PROHIBIDO usar formato Markdown (nada de asteriscos **, ni #, NI LISTAS, NI VIÑETAS). Escribe todo en párrafos normales y usa emojis conversacionales.
    8. CONOCIMIENTO EXTERNO: SOLO puedes vender o hablar de lo que esté en el catálogo proporcionado.
    9. TARJETAS DE PRODUCTO (VITAL): Cuando vayas a recomendar un producto (Y TENGA STOCK MAYOR A 0), DEBES incluir obligatoriamente al final de tu mensaje la tarjeta usando ESTE FORMATO EXACTO: [TARJETA | id | nombre | precio | imagen]. 
    ESTÁ ESTRICTAMENTE PROHIBIDO listar las características del producto como texto normal (ejemplo prohibido: "Precio: 50 S/, Imagen: url"). El "id" debe ser el número EXACTO que aparece en el catálogo.
    10. ENLACE DE PAGO (VITAL): Si el usuario indica que quiere comprar, pagar o finalizar su pedido, DEBES enviarle este enlace exacto: https://cubaaprende.site/checkout?source=techbot
   
    EJEMPLO DE RESPUESTA A "ESTOY BUSCANDO ALGO" (Pidiendo contexto sin tarjetas):
    ¡Hola! 👋 Claro que sí, en nuestra tienda tenemos excelentes opciones. Cuéntame, ¿qué tipo de artículo estás buscando o para qué lo necesitas? Así podré recomendarte lo mejor.
    
    EJEMPLO DE RESPUESTA A "RECOMIÉNDAME EL MEJOR" (Con stock disponible):
    ¡Perfecto! 🎧 Si buscas la mejor calidad de audio y durabilidad, Sony es superior en esta categoría. Te recomiendo esta opción a ojo cerrado:
    [TARJETA | 1 | Audífonos Sony WH-CH520 | 159.00 | https://url-imagen.jpg]
    
    EJEMPLO DE RESPUESTA PARA UN PRODUCTO SIN STOCK (Sin mostrar tarjeta):
    Me encantaría ofrecerte los Audífonos Sony WH-1000XM5 porque son excelentes, pero justo en este momento se nos han agotado. 😔 ¿Te gustaría que te envíe una notificación en cuanto volvamos a tenerlos en stock?
    
    EJEMPLO DE RESPUESTA PARA FINALIZAR COMPRA:
    ¡Excelente elección! 🚀 Puedes finalizar tu compra de forma segura con MercadoPago aquí mismo: https://cubaaprende.site/checkout?source=techbot`;
    
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