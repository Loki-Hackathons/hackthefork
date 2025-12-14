import { NextRequest, NextResponse } from 'next/server';
import { startShoppingAutomation } from '@/lib/automation/order-automation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dishId } = body;
    
    console.log('\n🚀 Request received to start Auchan automation');
    
    // Launch automation in background (don't wait)
    // Respond immediately to client
    startShoppingAutomation(dishId || 'burger-vege').catch((error) => {
      console.error('❌ Error during automation:', error.message);
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Automation started! The browser will open with your Auchan session...' 
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

