import { NextRequest, NextResponse } from 'next/server';
import { startShoppingAutomation } from '@/lib/automation/order-automation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dishId } = body;
    
    console.log('\n🚀 Requête reçue pour démarrer l\'automatisation Auchan');
    
    // Lancer l'automatisation en arrière-plan (ne pas attendre)
    // On répond immédiatement au client
    startShoppingAutomation(dishId || 'burger-vege').catch((error) => {
      console.error('❌ Erreur lors de l\'automatisation:', error.message);
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Automatisation démarrée ! Le navigateur va s\'ouvrir avec votre session Auchan...' 
    });
    
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'appel API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Erreur lors du démarrage de l\'automatisation' 
      },
      { status: 500 }
    );
  }
}

