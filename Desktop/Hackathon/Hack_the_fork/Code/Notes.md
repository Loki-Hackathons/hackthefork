Notes HackTheFork
Idée de base: récupérer plein de données sur les produits agro et sur les préférences de l’utilisateur, et déterminer intelligemment un panier adapté pour l’utilisateur
Données / RAG
Connaissance sémantique ET technique de tous les produits Carrefour
→ Composition technique (base de données structurée)
→ Description textuelle
→ tags, catégories, avantages/inconvénients

→ Récupération de ces données: 
Scraping de tous les produits Carrefour
diverses Requêtes API: Yuka, et autres ? Notamment grâce aux codes de chaque produit

Inputs
Historique Carrefour
Tickets de caisse scannés
Photos de plats
Vidéos de plats ou sacs de course complets
Préférences données par l’utilisateur textuellement
Préférences données par l’utilisateur via des boutons/selects:
→ Full végétarien ? Végan ? Flexitarien ? 
→ Boutons ou système de swipe ludique/interactif et intelligent pour la communication des préférences alimentaires. Style Akinator ou Tinder pour saisir rapidement les préférences de l’utilisateur

Output
Panier complet Carrefour Drive (et/ou autres supermarchés en ligne)

Question à se poser
En se basant sur les données et les inputs, comment déterminer le panier ?
→ Il faut de l’agentique / LLM mais aussi du déterministe:
Machine learning à intégrer, basés sur des papiers de recherche (cf. pdfs et autres recherches)
Calculs déterministes sur la composition technique des ingrédients, etc. 
Il faut vraiment trouver un prétexte pour intégrer un modèle de machine learning à créer nous-mêmes

→ Dans notre démo finale il faut montrer les papiers sur lesquels on s’est basés
