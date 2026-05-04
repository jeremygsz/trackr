import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    console.error('[ONBOARDING_ERROR] No session or user ID');
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { selectedBankIds } = await req.json();

    if (!Array.isArray(selectedBankIds) || selectedBankIds.length === 0) {
      return NextResponse.json({ error: 'Veuillez sélectionner au moins une banque' }, { status: 400 });
    }

    // Vérifier que l'utilisateur existe bien en base
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      console.error(`[ONBOARDING_ERROR] User ${session.user.id} not found in database`);
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Nettoyer les anciennes sélections pour éviter les doublons (idempotence)
      await tx.userBank.deleteMany({
        where: { userId: session.user.id }
      });

      // 2. Créer les nouvelles entrées UserBank
      // Utilisation d'une boucle create pour être plus précis sur les erreurs si nécessaire, 
      // bien que createMany soit plus performant.
      for (let i = 0; i < selectedBankIds.length; i++) {
        await tx.userBank.create({
          data: {
            userId: session.user.id,
            bankId: selectedBankIds[i],
            listOrder: i,
            selected: i === 0,
          }
        });
      }

      // 3. Marquer l'onboarding comme terminé
      await tx.user.update({
        where: { id: session.user.id },
        data: { onboardingCompleted: true },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ONBOARDING_ERROR]', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la sauvegarde',
      details: error.message 
    }, { status: 500 });
  }
}
