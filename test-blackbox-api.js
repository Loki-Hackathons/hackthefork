/**
 * Test simple de l'API Blackbox AI
 */

const API_KEY = "sk-ZRDD5Yygu4l7EQYGG3nJIg";
const API_URL = "https://api.blackbox.ai/chat/completions";

async function testBlackboxAPI() {
  console.log('🧪 Test de l\'API Blackbox AI...\n');
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "blackboxai/openai/gpt-4",
        messages: [
          {
            role: "user",
            content: "Dis-moi bonjour en français en une phrase"
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP:', response.status, response.statusText);
      console.error('Réponse:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('✅ API fonctionne !\n');
    console.log('📝 Réponse reçue:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(data.choices[0].message.content);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Métadonnées:');
    console.log('   - Modèle utilisé:', data.model);
    console.log('   - Tokens utilisés:', data.usage?.total_tokens || 'N/A');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'appel API:', error.message);
    console.error('Détails:', error);
  }
}

testBlackboxAPI();

