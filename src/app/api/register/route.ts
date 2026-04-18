import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  firstname: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastname: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  inviteCode: z.string().min(1, "Le code d'invitation est requis"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { firstname, lastname, email, password, inviteCode } = parsed.data;

    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // 2. Vérifier le code d'invitation
    const code = await prisma.inviteCode.findUnique({
      where: { code: inviteCode },
    });

    if (!code) {
      return NextResponse.json(
        { error: "Code d'invitation invalide" },
        { status: 400 }
      );
    }

    if (code.usedBy) {
      return NextResponse.json(
        { error: "Ce code d'invitation a déjà été utilisé" },
        { status: 400 }
      );
    }

    if (code.expiresAt && code.expiresAt < new Date()) {
       return NextResponse.json(
        { error: "Ce code d'invitation a expiré" },
        { status: 400 }
      );
    }

    // 3. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Créer l'utilisateur et mettre à jour le code d'invitation dans une transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstname,
          lastname,
          email,
          password: hashedPassword,
          role: 'user',
        },
      });

      await tx.inviteCode.update({
        where: { id: code.id },
        data: {
          usedBy: newUser.id,
          usedAt: new Date(),
        },
      });

      return newUser;
    });

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}

