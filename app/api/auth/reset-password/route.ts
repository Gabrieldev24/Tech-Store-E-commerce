import { prisma } from '@/lib/data/postgres';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    // 1. Buscar al usuario y validar que el código coincida
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.resetPasswordToken !== code) {
      return NextResponse.json({ error: 'El código es incorrecto o el usuario no existe' }, { status: 400 });
    }

    // 2. Validar que el código no haya expirado (opcional, si agregaste el campo de fecha)
    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      return NextResponse.json({ error: 'El código ha expirado. Solicita uno nuevo.' }, { status: 400 });
    }

    // 3. Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizar la contraseña en la BD y borrar el código usado
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({ message: 'Contraseña actualizada exitosamente' }, { status: 200 });

  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}