import { NextRequest, NextResponse } from 'next/server';
import { startShoppingAutomation } from '@/lib/automation/order-automation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients } = body;
    
    console.log('\n🚀 Request received to start Auchan automation');
    console.log('📋 Ingredients received:', ingredients);
    
    // Validate ingredients
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'La liste d\'ingrédients est requise et ne peut pas être vide' 
        },
        { status: 400 }
      );
    }
    
    // Validate that all ingredients are strings
    const invalidIngredients = ingredients.filter(ing => typeof ing !== 'string' || ing.trim().length === 0);
    if (invalidIngredients.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tous les ingrédients doivent être des chaînes de caractères non vides' 
        },
        { status: 400 }
      );
    }
    
    // Launch automation in background (don't wait)
    // Respond immediately to client
    startShoppingAutomation(ingredients).catch((error) => {
      console.error('❌ Error during automation:', error.message);
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Automation started! The browser will open with your Auchan session...',
      ingredientsCount: ingredients.length
    });
    
  } catch (error: any) {
    console.error('❌ Error during API call:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error starting automation' 
      },
      { status: 500 }
    );
  }
}

