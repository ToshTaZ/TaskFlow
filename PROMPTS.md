## Prompt 1 . User stories (Claude)

**Prompt : Tu es un développeur web qui aide des étudiants de 1ère année. Nous créons TaskFlow, une app de tâches en HTML, CSS et JavaScript sans framework. Propose 6 user stories au format "En tant que...je veux... afin de...". Pas de code. Réponds sous forme de liste.

**Résultat : Voici 6 user stories pour TaskFlow :

Ajouter une tâche : En tant qu’utilisateur, je veux saisir le titre d’une nouvelle tâche et la valider, afin de ne rien oublier de ce que j’ai à faire.
Marquer une tâche comme terminée : En tant qu’utilisateur, je veux cocher une tâche une fois réalisée, afin de visualiser ce qu’il me reste à accomplir.
Supprimer une tâche : En tant qu’utilisateur, je veux retirer une tâche devenue inutile ou ajoutée par erreur, afin de garder une liste claire et à jour.
Modifier une tâche : En tant qu’utilisateur, je veux corriger le texte d’une tâche existante, afin de la préciser sans avoir à la recréer.
Filtrer les tâches : En tant qu’utilisateur, je veux afficher uniquement les tâches à faire, terminées ou toutes, afin de me concentrer sur ce qui compte à un instant donné.
Conserver mes tâches : En tant qu’utilisateur, je veux retrouver ma liste même après avoir fermé ou rechargé la page, afin de ne pas perdre mon travail.

**Gardé : toutes les user stories

## Prompt 2 . Fonctionnalité filière

**Prompt : Nous sommes un binôme d'élèves de deux filières différentes. Pour l'application nous avons une fonctionnalité filière à gérer.
L'étudiant en informatique doit s'occuper de trier par priorité ou par échéance, filtrer par statut, faire des catégories avec une couleur et en bonus une recherche par mot-clé.
L'étudiant en cyberqsécurité doit gérer un écran de connexion avant d'accéder aux tâches, un contrôle de robustesse du mot de passe (8 caractères, majuscule, chiffre, caractère spécial) avec une jauge faible/moyen/fort, en bonus un blocage après 3 échecs.
Nous devons travailler sous ce modèle de données pour une tâche:
{
    "id": 1,
    "titre": "Réviser le CSS",
    "description": "Flexbox",
    "priorite": "haute",
    "echeance": "2026-11-15",
    "statut": "a_faire"
}
Nous utilisons cette structure de fichiers:
taskflow/
├── index.html
├── style.css
├── app.js
├── README.md
└── PROMPTS.md

Qu'est-ce qui manque à ce modèle pour ma fonctionnalité filière ?

**Résultat: Pour la partie informatique (tri, filtres, catégories, recherche), il manque surtout une chose : les catégories.

Ce qu’il faut ajouter

categorieId dans la tâche : il relie la tâche à une catégorie.
Une liste de catégories à part, par exemple { "id": 1, "nom": "Cours", "couleur": "#4F46E5" }. La couleur est stockée dans la catégorie et non dans chaque tâche, pour qu’un changement de couleur s’applique partout d’un coup.

Ce qu’il faut préciser, sans changer la structure

Valeurs autorisées pour priorite (par exemple basse, moyenne, haute) : pour trier par priorité, il faudra un ordre explicite (haute > moyenne > basse), car un tri alphabétique donnerait un résultat faux.
Valeurs autorisées pour statut (par exemple a_faire, en_cours, terminee) : le filtre en dépend.
echeance vide : décidez si une tâche peut ne pas avoir d’échéance, et où elle se place dans le tri. Le format AAAA-MM-JJ se trie correctement tel quel.
Recherche par mot-clé : titre et description suffisent, rien à ajouter.

Optionnel

dateCreation, utile comme critère de tri secondaire en cas d’égalité.

Exemple de tâche mise à jour :

json
{
  "id": 1,
  "titre": "Réviser le CSS",
  "description": "Flexbox",
  "priorite": "haute",
  "echeance": "2026-11-15",
  "statut": "a_faire",
  "categorieId": 1
}

Côté cybersécurité, pour que vous vous alignez dès le départ

Un modèle utilisateur : { "id", "identifiant", "motDePasseHash" }. Le mot de passe ne doit jamais être stocké en clair.
Pour le bonus de blocage : echecsConsecutifs et éventuellement bloqueJusqua.
utilisateurId dans la tâche, si chaque personne doit voir uniquement ses tâches.

Avec localStorage et sans serveur, l’authentification restera une simulation : un utilisateur qui ouvre la console du navigateur peut tout lire. Ça vaut la peine de le mentionner dans le README.

Si vous voulez, je peux vous proposer la structure complète de ces données (tâches, catégories, utilisateurs) pour localStorage.

**Gardé: - Ajout de categorieId dans le modèle de tâche
         - liste de catégorie
         - dateCreation
         - le modèle de tâche mis à jour
         - le modèle { "id", "identifiant", "motDePasseHash" }
         - echecsConsecutifs et bloqueJusqua
         - utilisateurId dans la tâche
         - le commentaire dans le README sur le fait que l'authentification restera une simulation en localStorage
