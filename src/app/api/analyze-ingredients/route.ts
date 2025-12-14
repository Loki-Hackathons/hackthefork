import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Analyser une image avec Blackbox AI pour détecter les ingrédients
async function analyzeImageWithBlackbox(imageUrl: string): Promise<string[]> {
  const apiKey = process.env.BLACKBOX_API_KEY;
  
  if (!apiKey) {
    throw new Error('BLACKBOX_API_KEY not configured');
  }

  try {
    // Vérifier que l'URL de l'image est valide
    if (!imageUrl || !imageUrl.startsWith('http')) {
      throw new Error('Invalid image URL');
    }

    // Vérifier que l'image est accessible
    try {
      const imageCheck = await fetch(imageUrl, { method: 'HEAD' });
      if (!imageCheck.ok) {
        console.warn(`Image URL not accessible: ${imageUrl} (status: ${imageCheck.status})`);
        // Continuer quand même, peut-être que Blackbox pourra y accéder
      }
    } catch (checkError) {
      console.warn('Could not verify image accessibility:', checkError);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Calling Blackbox AI with image URL:', imageUrl);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const response = await fetch('https://api.blackbox.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'blackboxai/google/gemini-3-pro-preview', // Gemini 3 Pro Preview with vision
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high' // Haute résolution pour mieux voir les détails
                }
              },
              {
                type: 'text',
                text: 'Analyse cette photo de plat cuisiné. Liste tous les ingrédients principaux que tu peux identifier dans l\'image. Réponds UNIQUEMENT avec une liste d\'ingrédients séparés par des virgules, sans numérotation ni puces. Format exact: ingrédient1, ingrédient2, ingrédient3. Exemple de réponse: tomates, mozzarella, basilic, huile d\'olive, pâtes'
              }
            ]
          }
        ],
        temperature: 0.1, // Très bas pour plus de précision
        max_tokens: 300 // Plus de tokens pour une liste complète
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Blackbox API error:', response.status, errorText);
      console.error('Request body was:', JSON.stringify({
        model: 'blackboxai/anthropic/claude-3.5-sonnet',
        messages: [/* truncated for logging */]
      }, null, 2));
      throw new Error(`Blackbox API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 Blackbox API response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Extraire le texte de la réponse (plusieurs formats possibles)
    let ingredientsText = '';
    if (data.choices?.[0]?.message?.content) {
      ingredientsText = data.choices[0].message.content;
    } else if (data.content) {
      ingredientsText = data.content;
    } else if (typeof data === 'string') {
      ingredientsText = data;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Extracted ingredients text:', ingredientsText);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!ingredientsText || ingredientsText.trim().length === 0) {
      console.warn('No ingredients text in Blackbox response');
      console.warn('Full response structure:', Object.keys(data));
      return [];
    }
    
    // Nettoyer le texte (enlever les guillemets, les listes numérotées, etc.)
    let cleanedText = ingredientsText
      .replace(/^["']|["']$/g, '') // Enlever guillemets au début/fin
      .replace(/^\d+\.\s*/gm, '') // Enlever numérotation
      .replace(/^[-•]\s*/gm, '') // Enlever puces
      .trim();
    
    // Parser la réponse pour extraire les ingrédients
    // Essayer plusieurs séparateurs
    let ingredients: string[] = [];
    
    if (cleanedText.includes(',')) {
      ingredients = cleanedText.split(',');
    } else if (cleanedText.includes(';')) {
      ingredients = cleanedText.split(';');
    } else if (cleanedText.includes('\n')) {
      ingredients = cleanedText.split('\n');
    } else {
      // Si pas de séparateur, prendre le texte entier comme un seul ingrédient
      ingredients = [cleanedText];
    }
    
    // Nettoyer chaque ingrédient
    ingredients = ingredients
      .map((ing: string) => ing.trim())
      .filter((ing: string) => {
        // Filtrer les ingrédients valides
        return ing.length > 0 && 
               ing.length < 50 && 
               !ing.match(/^(ingrédients?|ingredients?|liste|list)$/i); // Enlever mots-clés
      });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Parsed ${ingredients.length} ingredients:`, ingredients);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (ingredients.length === 0) {
      console.warn('⚠️  No ingredients extracted from Blackbox response');
      console.warn('📄 Original text was:', ingredientsText);
      console.warn('🧹 Cleaned text was:', cleanedText);
      console.warn('📊 Response structure:', Object.keys(data));
    }
    
    return ingredients;
  } catch (error: any) {
    console.error('Error analyzing image with Blackbox:', error);
    throw error;
  }
}

// GET /api/analyze-ingredients?post_id=xxx&force=true (optionnel)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('post_id');
    const force = searchParams.get('force') === 'true'; // Force la ré-analyse

    if (!postId) {
      return NextResponse.json(
        { error: 'Missing post_id parameter' },
        { status: 400 }
      );
    }

    // Vérifier si le post existe et récupérer l'image
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, image_url')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Vérifier si des ingrédients existent déjà (uniquement si force=false)
    if (!force) {
      const { data: existingIngredients, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('*')
        .eq('post_id', postId);

      if (ingredientsError) {
        console.error('Error fetching ingredients:', ingredientsError);
      }

      // Si des ingrédients existent déjà et qu'on ne force pas, les retourner
      if (existingIngredients && existingIngredients.length > 0) {
        console.log(`Using cached ingredients for post ${postId}`);
        return NextResponse.json({
          ingredients: existingIngredients,
          fromCache: true
        });
      }
    } else {
      // Si force=true, supprimer les anciens ingrédients
      console.log(`Force re-analysis: deleting old ingredients for post ${postId}`);
      const { error: deleteError } = await supabase
        .from('ingredients')
        .delete()
        .eq('post_id', postId);
      
      if (deleteError) {
        console.error('Error deleting old ingredients:', deleteError);
      }
    }

    // Analyser l'image avec Blackbox AI
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔬 Analyzing image for post ${postId}`);
    console.log(`🖼️  Image URL: ${post.image_url}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    let detectedIngredients: string[] = [];
    try {
      detectedIngredients = await analyzeImageWithBlackbox(post.image_url);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Detected ${detectedIngredients.length} ingredients:`, detectedIngredients);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } catch (analysisError: any) {
      console.error('Error analyzing with Blackbox:', analysisError);
      // Si l'analyse échoue, retourner un tableau vide plutôt que de planter
      return NextResponse.json({
        ingredients: [],
        fromCache: false,
        error: analysisError.message || 'Failed to analyze image'
      });
    }

    // Si aucun ingrédient détecté, essayer de récupérer les anciens ingrédients comme fallback
    if (detectedIngredients.length === 0) {
      console.warn(`No ingredients detected for post ${postId} with Blackbox AI`);
      
      // Fallback: récupérer les ingrédients créés lors de la création du post
      const { data: fallbackIngredients } = await supabase
        .from('ingredients')
        .select('*')
        .eq('post_id', postId);
      
      if (fallbackIngredients && fallbackIngredients.length > 0) {
        console.log(`Using fallback ingredients (${fallbackIngredients.length}) for post ${postId}`);
        return NextResponse.json({
          ingredients: fallbackIngredients,
          fromCache: false,
          fallback: true,
          warning: 'Blackbox AI n\'a pas détecté d\'ingrédients, utilisation des ingrédients détectés lors de la création du post'
        });
      }
      
      return NextResponse.json({
        ingredients: [],
        fromCache: false,
        warning: 'Aucun ingrédient détecté dans l\'image'
      });
    }

    // Stocker les ingrédients détectés dans la base de données
    const ingredientsData = detectedIngredients.map((name, index) => ({
      post_id: postId,
      name: name,
      confidence: 0.8, // Confiance par défaut pour Blackbox
      category: 'unknown' // Catégorie inconnue par défaut
    }));

    const { data: savedIngredients, error: saveError } = await supabase
      .from('ingredients')
      .insert(ingredientsData)
      .select();

    if (saveError) {
      console.error('Error saving ingredients:', saveError);
      // Ne pas planter si la sauvegarde échoue, retourner quand même les ingrédients
      return NextResponse.json({
        ingredients: ingredientsData,
        fromCache: false,
        warning: 'Ingredients detected but not saved to database'
      });
    }

    console.log(`Saved ${savedIngredients?.length} ingredients for post ${postId}`);

    return NextResponse.json({
      ingredients: savedIngredients || ingredientsData,
      fromCache: false
    });

  } catch (error: any) {
    console.error('Error in analyze-ingredients API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze ingredients' },
      { status: 500 }
    );
  }
}

