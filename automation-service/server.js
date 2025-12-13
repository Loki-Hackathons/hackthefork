import express from 'express';
import cors from 'cors';
import { startShoppingAutomation } from './carrefour-automation-playwright.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Route principale pour démarrer l'automatisation
app.post('/api/start-shopping', async (req, res) => {
  console.log('\n🚀 Requête reçue pour démarrer l\'automatisation Auchan');
  
  const { dishId } = req.body;
  
  try {
    // Répondre immédiatement au client
    res.status(200).json({ 
      success: true, 
      message: 'Automatisation démarrée ! Le navigateur va s\'ouvrir avec votre session...' 
    });
    
    // Lancer l'automatisation en arrière-plan
    await startShoppingAutomation(dishId || 'burger-vege');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'automatisation:', error.message);
    
    // Si l'erreur est liée à la session
    if (error.message.includes('Session non trouvée')) {
      console.log('\n📝 IMPORTANT: Exécutez "npm run save-session" pour sauvegarder votre session Auchan\n');
    }
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'auchan-automation-playwright',
    engine: 'Playwright'
  });
});

app.listen(PORT, () => {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Service d'automatisation Auchan (Playwright)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Endpoint: http://localhost:${PORT}/api/start-shopping`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`\n⚠️  IMPORTANT: Si c'est la première fois:`);
  console.log(`   Exécutez: npm run save-session`);
  console.log(`   pour sauvegarder votre session Auchan\n`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ ERREUR: Le port ${PORT} est déjà utilisé !`);
    console.error(`\n💡 Solution rapide (PowerShell):`);
    console.error(`   Get-NetTCPConnection -LocalPort ${PORT} | Select-Object -ExpandProperty OwningProcess | ForEach-Object { taskkill /PID $_ /F }`);
    console.error(`\n   Puis relancez: npm start\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
