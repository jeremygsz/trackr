import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const profileSchema = z.object({
  firstname: z.string().min(2).optional(),
  lastname: z.string().min(2).optional(),
  currency: z.string().length(3).optional(),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        currency: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.format() }, { status: 400 });
    }

    const { currentPassword, newPassword, ...updateData } = parsed.data;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Mot de passe actuel requis' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      (updateData as any).password = hashedNewPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        currency: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
