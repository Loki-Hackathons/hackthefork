# Configuration des variables d'environnement

## Fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Blackbox AI - Pour l'analyse d'images
BLACKBOX_API_KEY=your_blackbox_api_key
```

## Obtenir une clé API Blackbox

1. Allez sur [https://www.blackbox.ai](https://www.blackbox.ai)
2. Créez un compte ou connectez-vous
3. Accédez à votre dashboard API
4. Générez une nouvelle clé API
5. Copiez la clé et ajoutez-la dans `.env.local`

## Important

- Ne commitez JAMAIS le fichier `.env.local` (déjà dans `.gitignore`)
- La clé API Blackbox est utilisée pour analyser les images et détecter les ingrédients
- Le modèle utilisé est `blackboxai/anthropic/claude-3.5-sonnet` (vision + texte)

