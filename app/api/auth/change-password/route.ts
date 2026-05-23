import { NextResponse } from 'next/server';

import bcrypt from 'bcrypt';
import { prisma } from '@/lib/data/postgres';

export async function POST(req: Request) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    // 1. Buscar al usuario en la base de datos
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // 2. Verificar que la contraseña actual que ingresó sea la correcta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      // Este mensaje exacto es importante porque tu frontend lo está buscando para mostrar el error
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // 3. Encriptar la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizar la base de datos con la nueva contraseña
    await prisma.user.update({
      where: { email },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error en change-password:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}