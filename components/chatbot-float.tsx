'use client';

import { useState, useEffect, useCallback,useRef } from 'react';
import { X, Send, Sparkles, Scale, PackageSearch, MessageSquareQuote, Star } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { usePathname,useRouter } from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';

type Message = {
  id: string;
  role: 'bot' | 'user';
  content: string;
  isTyping?: boolean; 
};

const QUICK_OPTIONS = [
  { text: "Recomiéndame un producto", icon: Sparkles },
  { text: "Comparar productos", icon: Scale },
  { text: "¿Tienen stock disponible?", icon: PackageSearch },
  { text: "Tengo dudas acerca de un producto", icon: MessageSquareQuote }
];

// COMPONENTE MÁQUINA DE ESCRIBIR OPTIMIZADO Y SIN SALTOS
const TypewriterText = ({ 
  content, 
  speed = 12, 
  onComplete 
}: { 
  content: string; 
  speed?: number; 
  onComplete?: () => void; 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let i = 0;
    setCurrentIndex(0);
    const interval = setInterval(() => {
      i++;
      setCurrentIndex(i);
      if (i >= content.length) {
        clearInterval(interval);
        onComplete?.(); 
      }
    }, speed);

    return () => clearInterval(interval);
  }, [content, speed]);

  return (
      <p className="leading-relaxed whitespace-pre-wrap">
        <span>{content.substring(0, currentIndex)}</span>
        <span className="opacity-0">{content.substring(currentIndex)}</span>
      </p>
    );
};

// Función para extraer las tarjetas ocultas que manda la IA
const parseMessageWithCards = (text: string) => {
  const regex = /\[TARJETA\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]/g;
  
  // Limpiamos el texto para que la máquina de escribir no muestre el código feo
  const cleanText = text.replace(regex, '').trim();
  
  const cards = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    cards.push({
      id: match[1].trim(),
      name: match[2].trim(),
      price: match[3].trim(),
      image: match[4].trim()
    });
  }

  return { cleanText, cards };
};

const WelcomeTypewriter = ({ content, onComplete }: { content: string, onComplete: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCurrentIndex(i);
      if (i >= content.length) {
        clearInterval(interval);
        onComplete(); 
      }
    }, 25); // 25ms por letra da un efecto de escritura fluido

    return () => clearInterval(interval);
  }, [content, onComplete]);

  return (
    <p className="whitespace-pre-wrap m-0">
      <span>{content.substring(0, currentIndex)}</span>
      <span className="opacity-0">{content.substring(currentIndex)}</span>
    </p>
  );
};




export function ChatBotFloat() {
  const pathname = usePathname();
  const router = useRouter(); 
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isWelcomeTyped, setIsWelcomeTyped] = useState(false);
  // Estados para el sistema de Estrellitas (Rating)
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: '¡Hola! Soy TechBot. ¿En qué te puedo ayudar hoy?',
      isTyping: false 
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔥 Este efecto enciende la máquina de escribir JUSTO cuando abres el chat
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true); // Marcamos que ya se abrió
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === '1' ? { ...msg, isTyping: true } : msg
        )
      );
    }
  }, [isOpen, hasOpened]);

  useEffect(() => {
      // Si el chat está abierto, hacemos el scroll hacia abajo
      if (isOpen) {
        // El setTimeout le da a React 100 milisegundos para que termine 
        // de dibujar la ventana antes de forzar el scroll
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    }, [messages, isThinking, isOpen]); //  Fíjate que es "messages" limpio, sin los tres puntos

  const handleTypewriterComplete = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, isTyping: false } : msg))
    );
  }, []);

  const handleSendMessage = async (text: string) => { // 🔥 Agregamos 'async' aquí
    if (!text.trim() || isThinking) return;

    // 1. Creamos el mensaje del usuario
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };
    
    // 2. Actualizamos la pantalla con el mensaje del usuario
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsThinking(true);

    try {
      // 🔥 3. Armamos el historial completo para enviarlo al backend
      // Usamos el estado actual de 'messages' + el nuevo mensaje que acaba de enviar
      const chatHistory = [...messages, newUserMessage];

      sendGAEvent( 'event','uso_chatbot',
        {method: 'mensaje_texto'}

      )

      // 🔥 4. Llamamos a nuestra API (que conecta con Gemini y Prisma)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: chatHistory }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }

      const data = await response.json();

      // 5. Creamos la burbuja con la respuesta real de la IA
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.response, // 🔥 Aquí viene el texto de Gemini
        isTyping: true 
      };
      
      setMessages((prev) => [...prev, botResponse]);

    } catch (error) {
      console.error("Error en el chat:", error);
      
      // Mensaje de respaldo por si el internet falla o Gemini se cae
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "Uy, tuve un pequeño problema de conexión. ¿Podrías intentar enviarme el mensaje de nuevo?",
        isTyping: true 
      };
      setMessages((prev) => [...prev, errorResponse]);
      
    } finally {
      // Apagamos los puntitos de "Pensando..." pase lo que pase
      setIsThinking(false);
    }
  };

const handleResetChat = () => {
    setMessages([
      {
        id: '1',
        role: 'bot',
        content: '¡Hola! Soy TechBot. ¿En qué te puedo ayudar hoy?',
        isTyping: true //  Aquí SÍ va true, porque la ventana ya está abierta
      }
    ]);
    setShowRating(false);
    setRating(0);
    setHoverRating(0);
  };

  //  REGLA DE NEGOCIO: Ocultar en la pasarela de pago
  // Cambia '/checkout' por la ruta real que uses en tu proyecto para pagar
  //  REGLA DE NEGOCIO: Ocultar en pasarelas de pago y pantallas de autenticación
  if (
    pathname.includes('/checkout') || 
    pathname.includes('/cart') || 
    pathname.includes('/login') || 
    pathname.includes('/register')||
    pathname.includes('/forgot-password')||
    pathname.includes('/profile')||
    pathname.includes('/admin')

    
  ) {
    return null;
  }

  
  const hasCards = messages.some(msg => msg.content.includes('[TARJETA'));

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* 🔥 1. Ya no usamos "{isOpen && (" aquí. El div principal siempre existe. */}
      
      {/* Chat Window */}
      <div 
        className={`absolute bottom-20 right-0 bg-background border border-border rounded-2xl shadow-xl flex flex-col origin-bottom-right transition-all duration-300 ease-out
          
          /* 🔥 ANIMACIÓN DE APERTURA Y CIERRE SUAVE CON EL isOpen */
          ${isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
          }
          
          /* 🔥 TAMAÑO DINÁMICO REVERSIBLE */
          ${showRating 
            ? 'w-80 h-[480px]' 
            : hasCards 
              ? 'w-[400px] md:w-[500px] h-[550px] sm:h-[600px]' 
              : messages.length > 1 
                ? 'w-[380px] md:w-[420px] h-[500px]' 
                : 'w-80 h-[480px]' 
          }`}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 rounded-t-2xl flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
              <Image 
                src="/Logo Blanco.png" 
                alt="TechBot" 
                width={24} 
                height={24}
                className="h-6 w-6"
              />
              <span className="font-semibold tracking-wide">TechBot Assistant</span>
            </div>
            
            {messages.length > 1 && !showRating && (
              <button 
                onClick={() => setShowRating(true)}
                className="text-[11px] bg-white/20 hover:bg-destructive hover:text-white transition-colors px-2 py-1 rounded-md font-medium"
              >
                Terminar
              </button>
            )}
          </div>

          {/* VISTA DE ESTRELLITAS (CALIFICACIÓN) */}
          {showRating ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 bg-background rounded-b-2xl animate-in fade-in duration-300">
              
              {/* 🔥 EL SORPRENDEME: Contenedor Holográfico de Estrellas Animadas */}
              <div className="relative flex items-center justify-center h-16 w-16 bg-amber-500/10 rounded-full border border-amber-500/20 mb-2">
                {/* Estrella principal con pulso y rotación ultra lenta */}
                <Star className="h-8 w-8 text-amber-500 fill-amber-500 animate-pulse" />
                
                {/* Brillos orbitantes con efecto de expansión (Pings asíncronos) */}
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-ping [animation-duration:2s]" />
                <Sparkles className="absolute -bottom-2 -left-1 h-3.5 w-3.5 text-amber-300 animate-ping [animation-duration:2.5s] [animation-delay:500ms]" />
                <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping [animation-duration:3s]"></div>
              </div>

              <h3 className="font-semibold text-base text-center text-foreground tracking-tight">¿Qué tal te pareció la atención?</h3>
              <p className="text-xs text-muted-foreground text-center px-2">Tu opinión es muy importante para seguir mejorando a TechBot.</p>
              
              {/* Las 5 estrellitas interactivas con bloqueo */}
              <div className="flex gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    disabled={rating > 0} // 🔥 BLOQUEO: Desactiva el botón si ya votó
                    onClick={() => setRating(star)}
                    onMouseEnter={() => !rating && setHoverRating(star)} // 🔥 Evita hover si ya hay voto
                    onMouseLeave={() => !rating && setHoverRating(0)}
                    className={`transition-all duration-200 ${
                      rating > 0 
                        ? 'cursor-default opacity-90' 
                        : 'hover:scale-125 active:scale-90'
                    }`}
                  >
                    <Star
                      className={`h-7 w-7 transition-colors duration-200 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <div className="text-center space-y-1 animate-in zoom-in-95 duration-300">
                  <p className="text-xs font-bold text-amber-600 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                    ¡Gracias por calificarnos con {rating} {rating === 1 ? 'estrella' : 'estrellas'}!
                  </p>
                </div>
              )}

              <Button 
                onClick={handleResetChat}
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-medium shadow-sm transition-all"
              >
                Iniciar nuevo chat
              </Button>
            </div>
          ) : (
            <>
              {/* Messages Container */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 scroll-smooth">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    
                    {msg.role === 'bot' && (
                      <Image 
                        src="/logo-blanco.png" 
                        alt="TechBot" 
                        width={32} 
                        height={32}
                        className="h-8 w-8 rounded-full border border-border bg-white"
                      />
                    )}

             <div className={`rounded-2xl p-3 max-w-[85%] text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-card border border-border text-card-foreground rounded-tl-none shadow-sm'
                    }`}>
                      
                      {/* LÓGICA DE TARJETAS TEMU */}
                      {(() => {
                        const { cleanText, cards } = parseMessageWithCards(msg.content);
                        
                        return (
                          <div className="flex flex-col gap-2">
                            {/* 1. El texto normal */}
                            {msg.isTyping ? (
                              <TypewriterText 
                                content={cleanText} 
                                onComplete={() => handleTypewriterComplete(msg.id)} 
                              />
                            ) : (
                              <p className="leading-relaxed whitespace-pre-wrap">{cleanText}</p>
                            )}

                            {/* 2. Las Tarjetas Visuales (Solo se muestran si la IA envió productos) */}
                            {cards.length > 0 && !msg.isTyping && (
                              <div className="flex gap-2 mt-2 overflow-x-auto pb-2 custom-scrollbar">
                                {cards.map((card, idx) => (
                                  <div key={idx} className="bg-background rounded-xl p-2 border border-border shadow-sm flex flex-col items-center w-36 shrink-0 animate-in zoom-in duration-500 relative group overflow-hidden">
                                    {/* Contenedor de Imagen */}
                                    <div className="w-full h-24 bg-white rounded-lg flex items-center justify-center p-1 mb-2">
                                      <img src={card.image} alt={card.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                    </div>
                                    
                                    {/* Textos de la tarjeta */}
                                    <span className="text-[10px] font-medium text-center line-clamp-2 leading-tight h-7">{card.name}</span>
                                    <span className="text-xs font-bold text-primary mt-1 w-full text-center">S/ {card.price}</span>
                                    
                                    {/* Botón Acción Temu */}
                                    <button 
                                      onClick={() => router.push(`/product/${card.id}?source=techbot`)}
                                      className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1.5 rounded-lg mt-2 w-full hover:bg-primary/90 transition-colors shadow-sm"
                                    >
                                      Ver Producto
                                    </button>

                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}

                {/* Animación de "TechBot está escribiendo..." */}
                {isThinking && (
                  <div className="flex gap-3 justify-start items-end animate-in fade-in duration-300">
                    <Image 
                      src="/logo-blanco.png" 
                      alt="TechBot" 
                      width={32} 
                      height={32}
                      className="h-8 w-8 rounded-full border border-border bg-white"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground pl-1 animate-pulse">TechBot está escribiendo...</span>
                      <div className="bg-white border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5 w-fit">
                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Opciones Rápidas */}
{/* 🔥 OPCIONES RÁPIDAS (TU DISEÑO ORIGINAL + ANIMACIÓN) 🔥 */}
                {messages.length === 1 && !messages[0].isTyping && !isThinking && (
                  <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in duration-500">
                    {QUICK_OPTIONS.map((option, index) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(option.text)}
                          // 🔥 Tu diseño clásico intacto + la clase fill-mode-both
                          className="flex items-center gap-1.5 text-xs bg-background border border-primary/30 text-primary px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors text-left shadow-sm animate-in fade-in slide-in-from-left-6 fill-mode-both"
                          style={{ 
                            // La magia de la cascada que pediste
                            animationDelay: `${index * 120}ms`,
                            animationDuration: '500ms'
                          }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {option.text}
                        </button>
                      );
                    })}
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              

              {/* Input Area */}
              <div className="border-t border-border p-3 bg-background rounded-b-2xl">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    placeholder="Escribe tu consulta..."
                    disabled={isThinking}
                    className="flex-1 px-3 py-2 border border-border rounded-xl text-sm bg-muted/50 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                  />
                  <Button 
                    size="icon" 
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={isThinking || !inputValue.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 w-10 shrink-0 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-105 ${
          isOpen
            ? 'bg-destructive text-destructive-foreground rotate-90'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Image 
            src="/Logo Blanco.png" 
            alt="TechBot" 
            width={32} 
            height={32}
            className="h-8 w-8"
          />
        )}
      </button>
    </div>
  );
}

