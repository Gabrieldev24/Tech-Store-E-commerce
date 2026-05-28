import { prisma } from '@/lib/data/postgres';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializamos Resend con la llave de tu .env


export async function POST(req: Request) {

  const resend = new Resend(process.env.RESEND_API_KEY);
  try { 
    const { email } = await req.json();

    // 1. Verificar si el usuario existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Si el correo existe, se enviará un código.' }, { status: 200 });
    }

    // 2. Generar un código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // 3. Guardar el código en la base de datos
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetCode,
        resetPasswordExpires: expiration,
      },
    });

    // 4. Enviar el Correo con Resend
    const { data, error } = await resend.emails.send({
      from: 'TechStore <soporte@cubaaprende.site>', // Obligatorio en plan gratis de Resend
      to: [email],
      subject: 'Código de Recuperación - TechStore',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de Recuperación - TechStore</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0e14;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0e14; padding: 40px 0; width: 100%;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #161b22; border-radius: 12px; overflow: hidden; border: 1px solid #2d3748; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
                  
                  <tr>
                    <td align="center" style="padding: 30px; background-color: #0d1117; border-bottom: 2px solid #3a5afe;">
                      <img src="https://cdn.phototourl.com/free/2026-05-23-386a47b0-e43a-4b8c-bc75-ad5d31fdf027.png" alt="TechStore" style="height: 40px; display: block; border: 0;">
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 600;">Recuperación de contraseña</h1>
                      <p style="color: #a0aec0; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hola,<br><br>
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color: #ffffff;">TechStore</strong>. Utiliza el siguiente código de seguridad para completar el proceso:
                      </p>

                      <div style="background-color: #0d1117; border: 1px solid #3a5afe; border-radius: 8px; padding: 25px; margin: 35px auto; max-width: 250px; box-shadow: 0 0 20px rgba(58, 90, 254, 0.15);">
                        <p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #58a6ff; font-family: monospace;">
                          ${resetCode}
                        </p>
                      </div>

                      <p style="color: #a0aec0; font-size: 15px; line-height: 1.6; margin-bottom: 10px;">
                        Ingresa este código en nuestra plataforma para elegir tu nueva contraseña. <strong style="color: #e2e8f0;">Este código expirará en 15 minutos.</strong>
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #2d3748; margin: 35px 0;">
                      
                      <p style="color: #718096; font-size: 13px; line-height: 1.5; margin: 0;">
                        ¿No solicitaste este cambio? Puedes ignorar este correo de forma segura. Tu cuenta sigue protegida por el equipo de TechStore y nadie puede acceder sin este código.
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="background-color: #0d1117; padding: 20px; text-align: center; border-top: 1px solid #2d3748;">
                      <p style="color: #4a5568; font-size: 12px; margin: 0;">
                        &copy; 2026 TechStore. Todos los derechos reservados.<br>
                        Este es un mensaje automático, por favor no respondas a este correo.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Error de Resend:', error);
      return NextResponse.json({ error: 'Error al enviar el correo' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Código enviado exitosamente.' }, { status: 200 });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}