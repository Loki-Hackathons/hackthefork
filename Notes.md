Notes
Notre idée: une application (webapp) qui choisit et fait les courses pour toi, avec une incitation vers l’écolo/végé/healthy
Notre projet agrège des idées des applications suivantes:
Tinder: swiper sur des images de plats, l’algo s’affine pour apprendre tes goûts et recommander des plats qui te correspondent. Utile pour comprendre les goûts de l’utilisateur, surtout au début
Jow: Pour un plat donné que tu aimes, bouton pour l’ajouter au panier. Via un SSO à Carrefour Drive ou d’autres supermarchés, ajout automatique de tous les produits nécessaires pour faire ce plat. Après commande, récupérer les infos des produits. 
Cal (pas un vrai équivalent): Prendre en photo ton plat actuel, détection des aliments utilisés ou infos sensorielles, et recommandation d’une alternative.
BeReal (main): réseau social avec social incentives, système d’amis et de partage régulier
→ Une fois un plat cuisiné (suite à une recommandation Tinder ou partage BeReal ou juste sa propre initiative), envoyer une photo du plat avec rating de l’appréciation de l’utilisateur ET un scoring algorithmique écolo/végé/healthy
→ Après une recommandation d’alternative faite par la feature Cal, si l’utilisateur achète et fait le plat, possibilité de publier avant/après 
Gamification: Système de défis: parmi un groupe d’amis, leaderboard de ceux qui ont eu le meilleur score sur une semaine, et/ou suggérer à tout un groupe d’amis de faire un certain plat qui a un bon score (basé sur les préférences communes de tous ces amis)

Pour le scoring algorithmique écolo/végé/healthy, se baser sur la photo ET sur les produits achetés en SSO (via la feature Jow) ⇒ capter quels produits exacts ont été utilisés pour faire le plat, et se baser sur ces produits exacts (label, Yuka, nutriscore, etc.) pour scorer entre 0 et 100

Business Model: publicités. Certains plats auront dans leur décomposition des produits sponsorisés.

Il faut réfléchir à une interface ULTRA stylée. Il faut qu’on puisse s’y repérer facilement (ergonomie etc.) mais il faut aussi à certains endroits un effet WOW extrêmement stylé, quitte à ce que ce soit overkill (mais pas partout, car on doit quand même pouvoir s’y retrouver facilement)

Les différentes sections:
Gestion des amis
Le fil avec ce qu’ont posté les amis etc.
Profil: à quel point tu es healthy, ton historique, ta progression etc. 
Défis (publiés par amis et défis généraux)
Tinder des plats (surtout utile au début pour comprendre les goûts, mais catégorie toujours disponible)

Stack technique: webapp HTML/CSS/Typescript + backend Python avec FastAPI, authentification Supabase. Clairement orienté mobile: webapp dont le design et l’ergonomie sont orientés mobile.

Slogan/Impact intéressant:
People don’t want to save the planet.
They want to belong.
We make low-carbon eating visible.

Notes bonus
Modèle 3D des plats, zoomables etc. à la fin
Gamification plus avancée
Possibilité de décrire ce qu’on veut, et suggestions intelligentes avec bon score (par exemple “je veux un burger mais avec un meilleur score”)
