## Prompt 1 . User stories (Claude/ ChatGPT)

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

## Prompt 3 . itération sur ajouter tache

**Prompt : reprend le projet TaskFlow. approfondi l'user stories "ajouter une tache" que tu m'avais proposé et Explique ton raisonnement avant de répondre
Pose moi 3 questions avant de commencer
Liste ce que tu as supposé 
Qu'est-ce qui pourrait être faux dans ta réponse ?

**Résultat: Parfait. Nous allons reprendre TaskFlow et approfondir la user story « Ajouter une tâche » pour obtenir quelque chose de suffisamment précis pour servir de base au développement.

Avant de commencer, j'ai 3 questions.
1. Quel niveau de détail souhaites-tu ?
- A. Une user story détaillée avec ses critères d'acceptation.
- B. Une user story détaillée avec les règles de gestion et les cas particuliers.
- C. Une spécification complète : description, critères d'acceptation, règles de gestion, cas d'erreur et comportement de l'interface.
2. Quelles informations doivent être obligatoires lors de la création d'une tâche ?
Pour rappel, notre modèle actuel contient :
- Titre
- Description
- Priorité
- Échéance
- Statut
- Catégorie
- Date de création
- Identifiant de l'utilisateur
Souhaites-tu rendre certains champs facultatifs ? Par exemple, une tâche pourrait-elle être créée sans description, sans échéance ou sans catégorie ?
3. Souhaites-tu intégrer les fonctionnalités de vos deux filières dans cette user story ?
Par exemple :
- Informatique : sélection d'une catégorie colorée et définition de la priorité et de l'échéance.
- Cybersécurité : association automatique de la tâche à l'utilisateur connecté et vérification de son authentification avant la création.

Une fois tes réponses obtenues, je présenterai :
1. La user story approfondie.
2. Mon raisonnement de conception (les critères et choix qui justifient les décisions, plutôt qu'un raisonnement interne détaillé).
3. Les critères d'acceptation.
4. Les hypothèses que j'aurai faites.
5. Les points qui pourraient être inexacts ou nécessiter une validation.
Je resterai cohérent avec le modèle de données et l'architecture actuelle de TaskFlow.

**Gardé: rien car il nous pose une question

## Prompt 4 . réponses aux question proposé sur ajouter tache

**Prompt : nous souhaitons une user stories détaillé avec les règles de gestion et les cas particuliers les seules informations obligatoires a la création d'une taches sont titre, date de création et identifiant de l'utilisateur. tes proposition pour intégrer nos deux fonctionnalité de filières dans cet user stories nous conviennent

**Résultat: TaskFlow — User Story : Ajouter une tâche
Nous allons approfondir cette fonctionnalité en tenant compte de vos deux filières : informatique et cybersécurité.

L'objectif est d'obtenir une spécification suffisamment précise pour que vous puissiez ensuite vous répartir le développement sans ambiguïté.
1. User story principale
User Story US-01
Ajouter une tâche

En tant qu'utilisateur connecté, je veux pouvoir créer une nouvelle tâche en renseignant son titre et éventuellement ses autres informations (description, priorité, échéance et catégorie), afin d'organiser mon travail et de suivre les actions que je dois réaliser.

2. Informations de la tâche
Votre modèle de données actuel est conservé :
{
  "id": 1,
  "titre": "Réviser le CSS",
  "description": "Flexbox",
  "priorite": "haute",
  "echeance": "2026-11-15",
  "statut": "a_faire",
  "categorieId": 1,
  "dateCreation": "2026-10-30",
  "utilisateurId": 1
}


Voici les règles associées à chaque champ :
Champ	Obligatoire	Règle
id	Automatique	Identifiant unique
titre	Oui	Ne doit pas être vide
description	Non	Texte libre
priorite	Non	Basse, moyenne ou haute
echeance	Non	Date facultative
statut	Automatique	a_faire par défaut
categorieId	Non	Catégorie existante
dateCreation	Oui	Date générée automatiquement
utilisateurId	Oui	Identifiant de l'utilisateur connecté

Point important : l'utilisateur ne doit pas pouvoir choisir librement son identifiant. Celui-ci doit être récupéré depuis sa session de connexion.
3. Règles de gestion
RG-01 — Authentification
- L'utilisateur doit être connecté pour accéder à la création d'une tâche.
- Un utilisateur non connecté ne peut pas créer de tâche.
- Chaque tâche est automatiquement associée à l'utilisateur connecté.
RG-02 — Titre
- Le titre est obligatoire.
- Un titre vide ou composé uniquement d'espaces est refusé.
- Le titre est enregistré après suppression des espaces inutiles au début et à la fin.
- Une tâche peut avoir le même titre qu'une autre.
RG-03 — Description
- La description est facultative.
- Elle peut être laissée vide.
- Elle permet de préciser le contenu de la tâche.
RG-04 — Priorité
- La priorité est facultative.
- Trois niveaux sont disponibles : basse, moyenne et haute.
- Si aucune priorité n'est sélectionnée, la tâche n'a pas de priorité définie (null).
- La priorité pourra ensuite être utilisée par la fonctionnalité de tri.
RG-05 — Échéance
- L'échéance est facultative.
- Elle doit respecter le format de date attendu.
- Une échéance passée reste autorisée : une tâche en retard peut toujours être créée.
- Une tâche sans échéance doit pouvoir être enregistrée.
RG-06 — Catégorie
- La catégorie est facultative.
- L'utilisateur peut sélectionner une catégorie existante.
- Une catégorie inexistante ne peut pas être associée à une tâche.
- La couleur est récupérée depuis la catégorie et non enregistrée directement dans la tâche.
RG-07 — Date de création
- La date est générée automatiquement lors de la création.
- L'utilisateur ne peut pas la modifier depuis le formulaire.
- Elle correspond à la date réelle de création.
RG-08 — Statut
- Toute nouvelle tâche possède automatiquement le statut a_faire.
- L'utilisateur ne choisit pas le statut lors de la création.
- Le statut pourra être modifié ultérieurement.
RG-09 — Enregistrement
- Chaque tâche possède un identifiant unique.
- La tâche est enregistrée dans le stockage local (localStorage).
- Après création, elle apparaît dans la liste des tâches.
- Un message confirme la création.
4. Cas particuliers et comportements attendus
Situation	Comportement attendu
Titre vide	Refuser la création
Titre avec espaces uniquement	Refuser la création
Titre déjà utilisé	Autoriser la création
Description vide	Autoriser la création
Aucune priorité	Enregistrer sans priorité
Aucune échéance	Enregistrer sans échéance
Échéance passée	Autoriser la création
Aucune catégorie	Enregistrer sans catégorie
Catégorie supprimée	Ne pas conserver une référence invalide
Utilisateur déconnecté	Refuser la création
Stockage local indisponible	Signaler l'échec de l'enregistrement
Double clic sur valider	Éviter la création en double

5. Critères d'acceptation
Ces critères permettent de vérifier concrètement que la fonctionnalité fonctionne.
Tests de validation US-01
0 / 14 tests validés
Réinitialiser


[ ] Un utilisateur connecté peut ouvrir le formulaire de création.
[ ] Le formulaire contient un champ titre obligatoire.
[ ] Une tâche avec uniquement un titre peut être créée.
[ ] Une tâche sans description peut être créée.
[ ] Une tâche sans priorité peut être créée.
[ ] Une tâche sans échéance peut être créée.
[ ] Une tâche sans catégorie peut être créée.
[ ] La date de création est générée automatiquement.
[ ] Le statut initial est automatiquement a_faire.
[ ] L'identifiant de l'utilisateur connecté est automatiquement associé.
[ ] Une tâche créée apparaît dans la liste.
[ ] Un utilisateur déconnecté ne peut pas créer de tâche.
[ ] Un titre vide provoque un message d'erreur.
[ ] Une erreur de stockage est signalée à l'utilisateur.

6. Répartition du travail entre les deux filières
Informatique	Cybersécurité
Création du formulaire HTML	Vérification de la connexion
Gestion des champs facultatifs	Association à l'utilisateur connecté
Sélection de priorité	Vérification des droits d'accès
Sélection des catégories colorées	Protection contre les modifications d'identité
Validation des données	Vérification des données avant enregistrement
Ajout à la liste des tâches	Vérification de l'isolation des tâches entre utilisateurs

Les deux étudiants devront travailler ensemble sur l'enregistrement final dans localStorage.

7. Raisonnement de conception
Voici les principaux choix qui justifient cette spécification :
1. Limiter les champs obligatoires : vous souhaitez une création rapide. Imposer uniquement le titre, la date de création et l'utilisateur permet de créer une tâche sans devoir remplir systématiquement tous les champs.
2. Automatiser les informations techniques : l'identifiant, la date de création et le statut initial sont générés par l'application. Cela évite les erreurs de saisie.
3. Séparer les responsabilités : l'informatique gère les fonctionnalités métier et l'interface, tandis que la cybersécurité s'occupe de l'authentification, des autorisations et de l'intégrité des données.
4. Prévoir les cas particuliers : une tâche sans échéance ou sans catégorie doit rester parfaitement valide. Cela évite de rendre l'application inutilement contraignante.
8. Liste des hypothèses
Voici ce que j'ai supposé pour construire cette spécification :
- Les tâches sont personnelles à chaque utilisateur.
- Un utilisateur ne peut consulter et modifier que ses propres tâches.
- Les catégories sont communes ou disponibles dans un référentiel partagé.
- Le statut initial est toujours a_faire.
- Une priorité non renseignée est représentée par null.
- Une catégorie non renseignée est également représentée par null.
- La date de création est enregistrée au format AAAA-MM-JJ.
- Le stockage utilisé est localStorage, sans serveur.
9. Qu'est-ce qui pourrait être faux ou à revoir ?
Il y a quelques points qui méritent votre attention :

1. La sécurité de localStorage

Le stockage local ne constitue pas une véritable protection. Un utilisateur peut modifier les données depuis les outils de développement du navigateur. L'authentification sera donc une simulation pédagogique, pas une sécurité réelle.

2. La date de création

Stocker uniquement la date ne permet pas de distinguer deux tâches créées le même jour. Un horodatage complet serait plus précis.

3. Les catégories

Si les catégories sont communes, leur suppression peut affecter les tâches de plusieurs utilisateurs. Il faudra définir précisément le comportement attendu.

4. La validation des données

Les vérifications réalisées uniquement dans le formulaire peuvent être contournées. Il faut également vérifier les données dans JavaScript avant leur enregistrement.

10. Structure de fichiers concernée
Votre architecture reste inchangée :
taskflow/
├── index.html
├── style.css
├── app.js
├── README.md
└── PROMPTS.md


La fonctionnalité sera principalement développée dans index.html, style.css et app.js.

Ma recommandation : validez d'abord cette spécification avec votre binôme avant de coder. Le point le plus important à trancher est la gestion des catégories : communes à tous les utilisateurs ou propres à chaque utilisateur. Cela aura un impact sur votre modèle de données.

**Gardé: on garde la plupart des Règles de gestion

**Rejeté: deux taches peuvent avoir le meme titre et ensuite les catégories sont limitées

**Pourquoi : lisibilité et liberté de catégorisations

## Prompt 5 . validation des paramètres de l'ajout d'une tache

**Prompt: Ce que tu semble ne pas avoir compris c'est que c'est toi qui vas devoir créer cette application lors d'une autre séance pour l'instant on réfléchi seulement au projet nous fixons avec toi les features de cette application. la plupart de tes propositions nous conviennent en revanche pour RG2 une tache ne peux pas avoir le même titre qu'une autre et pour RG6 il n'y a pas de catégories préétablies sauf celle par défaut la catégorie "divers" on peu ensuite personnaliser autant de catégories que l'on veux

**Réponse: Tu as raison, j'avais anticipé la phase de développement alors que nous sommes encore dans la phase de conception de TaskFlow.

Notre objectif actuel est de construire ensemble le cahier des charges fonctionnel : définir les fonctionnalités, les règles de gestion, les contraintes et les comportements attendus. Nous ne coderons rien pour le moment.

Je prends en compte tes deux corrections.
Modifications apportées
RG-02 — Titre
Nouvelle règle :
- Le titre est obligatoire.
- Un titre vide ou composé uniquement d'espaces est refusé.
- Les espaces inutiles au début et à la fin sont supprimés.
- Deux tâches ne peuvent pas avoir le même titre.
- La comparaison des titres doit être insensible à la casse : « Réviser le CSS » et « réviser le css » sont considérés comme identiques.
La vérification doit empêcher la création d'un doublon.
RG-06 — Catégories
Nouvelle règle :
- Une catégorie par défaut nommée « Divers » existe dès la création de TaskFlow.
- Toutes les nouvelles tâches sont associées à « Divers » par défaut.
- L'utilisateur peut créer autant de catégories personnalisées qu'il le souhaite.
- Chaque catégorie possède un nom et une couleur.
- L'utilisateur peut modifier le nom et la couleur de ses catégories.
- L'utilisateur peut supprimer ses catégories personnalisées.
- La catégorie « Divers » ne peut pas être supprimée.
- Lorsqu'une catégorie personnalisée est supprimée, les tâches qui lui étaient associées sont réaffectées à « Divers ».
Deux décisions restent à préciser
Pour éviter de construire un modèle de données qui ne correspondrait pas à vos attentes, j'ai deux questions importantes.

1. Unicité des titres

Est-ce que deux utilisateurs différents peuvent avoir une tâche portant le même titre ?
- A. Non, aucun doublon dans toute l'application.
- B. Oui, chaque utilisateur peut avoir ses propres titres, mais pas de doublons dans sa liste personnelle.
2. Personnalisation des catégories

Les catégories personnalisées sont-elles :
- A. Propres à chaque utilisateur : chacun gère ses catégories.
- B. Communes : tous les utilisateurs partagent les mêmes catégories.
Ces deux décisions auront un impact sur la structure des données et les règles de gestion.

Nous continuerons ensuite à enrichir le cahier des charges de TaskFlow, fonctionnalité par fonctionnalité, avant de passer au code.

**Gardé: L'user story est validé

## Prompt 6 . Itération sur Marquer une tâche terminée

**Prompt: Du coup pour l'unicité des titres nous gardons que deux users peuvent avoir une tâche du même titre, el doublon est interne au compte. Les catégories sont propres à chaque user.

Passons maintenant à marquer une tâche comme terminée:
approfondis ton raisonnement sur cette feature, explique le avant de répondre, liste ce que tu as supposé et dit moi ce qui pourrait être faux dans ta réponse ?

**Résultat: TaskFlow, user story : Marquer une tâche comme terminée

Bien noté : unicité des titres au sein d’un compte (deux utilisateurs peuvent avoir le même titre) et catégories propres à chaque utilisateur. Je les intègre à ce qui suit.

1. Mon raisonnement avant de spécifier

Cette feature a l’air simple (une case à cocher), mais elle touche presque toutes les autres. Voici les questions de conception que j’ai identifiées et ce que j’ai choisi.

Une tâche terminée peut-elle redevenir « à faire » ? J’ai choisi oui. On se trompe souvent en cochant, et la user story « Ajouter une tâche » indique déjà que le statut « pourra être modifié ultérieurement ». Une action irréversible serait frustrante.
Qu’est-ce que « terminée » change dans les données ? Le statut passe à terminee. J’ajoute aussi une date de fin (dateCompletion), car elle permet d’afficher « terminée le… » et de distinguer une tâche finie à temps d’une tâche finie en retard.
Que devient la tâche à l’écran ? Elle reste visible mais change d’apparence (texte barré, grisé). Elle ne disparaît pas, sinon le filtre « terminées » de la partie informatique n’aurait aucun sens.
Comment cette feature interagit avec les autres ? Une tâche terminée ne doit plus être signalée « en retard », elle compte encore dans l’unicité des titres, et elle suit le filtre par statut et le tri.
Qui peut cocher quoi ? Uniquement l’utilisateur propriétaire de la tâche, ce qui touche directement le travail de la partie cybersécurité.
2. User story

US-02, Marquer une tâche comme terminée

En tant qu’utilisateur connecté, je veux marquer l’une de mes tâches comme terminée (et pouvoir revenir en arrière), afin de visualiser ce qu’il me reste à accomplir et de suivre mon avancement.

3. Impact sur le modèle de données

Un seul champ ajouté, et la valeur terminee du statut :

json
{
  "id": 1,
  "titre": "Réviser le CSS",
  "description": "Flexbox",
  "priorite": "haute",
  "echeance": "2026-11-15",
  "statut": "terminee",
  "categorieId": 1,
  "dateCreation": "2026-10-30",
  "dateCompletion": "2026-11-12",
  "utilisateurId": 1
}

dateCompletion vaut null tant que la tâche n’est pas terminée.

4. Règles de gestion

RG-01, Authentification et propriété

Seul un utilisateur connecté peut changer le statut d’une tâche.
Il ne peut agir que sur ses propres tâches (utilisateurId identique à celui de la session).

RG-02, Passage à « terminée »

Le statut passe à terminee.
dateCompletion est générée automatiquement à ce moment-là et ne peut pas être saisie à la main.
La modification est enregistrée dans localStorage et l’affichage est mis à jour sans recharger la page.

RG-03, Retour en arrière

Une tâche terminée peut être décochée : elle repasse à a_faire.
dateCompletion repasse à null.

RG-04, Autres champs inchangés

Marquer une tâche comme terminée ne modifie ni le titre, ni la description, ni la priorité, ni l’échéance, ni la catégorie.

RG-05, Affichage

Une tâche terminée reste dans la liste avec un style distinct (texte barré, atténué). L’information ne repose pas sur la couleur seule, pour rester lisible par tous.
Sa catégorie colorée reste visible.

RG-06, Interaction avec les échéances

Une tâche terminée n’est jamais signalée comme « en retard », même si son échéance est passée.

RG-07, Interaction avec filtres et tri

Le filtre par statut tient compte du changement immédiatement : si le filtre « à faire » est actif, la tâche cochée disparaît de la vue.
Le tri en cours reste appliqué.

RG-08, Unicité des titres

Une tâche terminée reste prise en compte dans la règle d’unicité : on ne peut pas créer une nouvelle tâche du même titre dans le même compte.

RG-09, Fiabilité

Si l’enregistrement échoue, l’état affiché revient à l’état précédent et un message d’erreur est affiché.
Un double clic rapide ne doit pas provoquer deux changements d’état successifs.
5. Cas particuliers
Situation	Comportement attendu
Cocher une tâche à faire	Statut terminee, date de fin enregistrée
Décocher une tâche terminée	Retour à a_faire, date de fin effacée
Tâche sans échéance	Peut être terminée normalement
Tâche en retard	Peut être terminée, l’alerte de retard disparaît
Tâche d’un autre utilisateur	Modification refusée
Utilisateur déconnecté	Modification refusée
Filtre « à faire » actif	La tâche cochée disparaît de la vue
Échec de localStorage	Message d’erreur, état précédent restauré
Double clic rapide	Un seul changement pris en compte
Tâche supprimée entre-temps (autre onglet)	Message d’erreur, liste rafraîchie
6. Critères d’acceptation
 Chaque tâche affiche un contrôle pour la marquer comme terminée.
 Cocher une tâche passe son statut à terminee.
 dateCompletion est remplie automatiquement.
 La tâche terminée est visuellement distincte.
 Décocher la tâche la remet à a_faire et efface dateCompletion.
 Le changement persiste après rechargement de la page.
 Le filtre par statut réagit immédiatement.
 Une tâche terminée n’est pas signalée en retard.
 Les autres champs de la tâche restent identiques.
 Un utilisateur ne peut pas modifier la tâche d’un autre.
 Un utilisateur déconnecté ne peut rien modifier.
 Une erreur de stockage est signalée et l’état est restauré.
7. Répartition entre les deux filières
Informatique	Cybersécurité
Contrôle de statut sur chaque tâche	Vérification de la session avant modification
Style des tâches terminées	Vérification que la tâche appartient à l’utilisateur
Mise à jour de la liste et des filtres	Refus des modifications non autorisées
Génération de dateCompletion	Contrôle de cohérence des données avant enregistrement
8. Ce que j’ai supposé
Il n’y a que deux états visibles pour l’utilisateur dans cette feature : à faire et terminée.
Le statut en_cours, évoqué plus tôt, n’est pas géré ici.
Le retour en arrière se fait avec le même contrôle que pour terminer (une case à cocher).
Il n’y a pas de confirmation avant de cocher.
Une tâche terminée reste dans la liste sans limite de temps (pas d’archivage automatique).
Le statut de retard est calculé à l’affichage et n’est pas stocké.
Les dates sont au format AAAA-MM-JJ, comme dateCreation.
9. Ce qui pourrait être faux
en_cours : si vous voulez trois statuts (à faire, en cours, terminée), la logique de cette user story change : cocher ne suffit plus. Il faudrait décider si on peut passer directement de « à faire » à « terminée ».
La date de fin : elle ajoute un champ qui n’était pas dans votre modèle de départ. Si vous la jugez inutile, on la retire sans toucher au reste.
L’unicité des titres (RG-08) : bloquer un titre déjà utilisé par une tâche terminée peut gêner l’usage (une tâche récurrente comme « Faire les courses » ne pourrait jamais être recréée). Vous pourriez préférer n’appliquer la règle qu’aux tâches non terminées. C’est un choix à faire de votre côté.
Le retour en arrière : vous pourriez vouloir qu’une tâche terminée soit définitive. C’est un choix de produit, pas une évidence technique.
Le comportement avec un filtre actif : faire disparaître la tâche cochée peut surprendre l’utilisateur. Une alternative serait de la laisser visible jusqu’au prochain rafraîchissement.
La sécurité : comme localStorage est modifiable depuis le navigateur, la vérification de propriété restera une simulation pédagogique, et non une vraie protection.
10. Décisions à trancher ensemble

Deux points ont le plus d’impact sur la suite : les statuts (deux ou trois) et l’unicité du titre pour les tâches terminées. Dites-moi ce que vous en pensez, et on passe à la user story suivante.

**Gardé: Modèle de tâche mis à jour, les règles de gestion
**Rejeté: Aspect barré, préférence pour une police plus claire, aspect atténué OK.

## Prompt 7 . Validation Marquer uen tâche terminée 

**Prompt: Toutes tes règles nous conviennent, à part l'aspect barré pour les tâches vaidées, on gardera une police plus claire et un fond atténué. Redonne moi donc la User story mise à jour ainsi que le modèle d'une tâche et la structure du projet mis à jour.

**Résultat: TaskFlow, User story mise à jour
US-02, Marquer une tâche comme terminée

En tant qu’utilisateur connecté, je veux marquer l’une de mes tâches comme terminée (et pouvoir revenir en arrière), afin de visualiser ce qu’il me reste à accomplir et de suivre mon avancement.

Règles de gestion

RG-01, Authentification et propriété

Seul un utilisateur connecté peut changer le statut d’une tâche.
Il ne peut agir que sur ses propres tâches (utilisateurId identique à celui de la session).

RG-02, Passage à « terminée »

Le statut passe à terminee.
dateCompletion est générée automatiquement à ce moment-là et ne peut pas être saisie à la main.
La modification est enregistrée dans localStorage et l’affichage est mis à jour sans recharger la page.

RG-03, Retour en arrière

Une tâche terminée peut être décochée : elle repasse à a_faire.
dateCompletion repasse à null.

RG-04, Autres champs inchangés

Marquer une tâche comme terminée ne modifie ni le titre, ni la description, ni la priorité, ni l’échéance, ni la catégorie.

RG-05, Affichage (modifiée)

Une tâche terminée reste dans la liste avec un style distinct : police plus claire et fond atténué. Le texte n’est pas barré.
Sa catégorie colorée reste visible.
Le contraste doit rester suffisant pour que le texte reste lisible, même atténué.

RG-06, Interaction avec les échéances

Une tâche terminée n’est jamais signalée comme « en retard », même si son échéance est passée.

RG-07, Interaction avec filtres et tri

Le filtre par statut tient compte du changement immédiatement : si le filtre « à faire » est actif, la tâche cochée disparaît de la vue.
Le tri en cours reste appliqué.

RG-08, Unicité des titres

Une tâche terminée reste prise en compte dans la règle d’unicité : on ne peut pas créer une nouvelle tâche du même titre dans le même compte.

RG-09, Fiabilité

Si l’enregistrement échoue, l’état affiché revient à l’état précédent et un message d’erreur est affiché.
Un double clic rapide ne doit pas provoquer deux changements d’état successifs.
Cas particuliers
Situation	Comportement attendu
Cocher une tâche à faire	Statut terminee, date de fin enregistrée
Décocher une tâche terminée	Retour à a_faire, date de fin effacée
Tâche sans échéance	Peut être terminée normalement
Tâche en retard	Peut être terminée, l’alerte de retard disparaît
Tâche d’un autre utilisateur	Modification refusée
Utilisateur déconnecté	Modification refusée
Filtre « à faire » actif	La tâche cochée disparaît de la vue
Échec de localStorage	Message d’erreur, état précédent restauré
Double clic rapide	Un seul changement pris en compte
Tâche supprimée entre-temps (autre onglet)	Message d’erreur, liste rafraîchie
Critères d’acceptation
 Chaque tâche affiche un contrôle pour la marquer comme terminée.
 Cocher une tâche passe son statut à terminee.
 dateCompletion est remplie automatiquement.
 La tâche terminée a une police plus claire et un fond atténué, sans texte barré.
 Décocher la tâche la remet à a_faire et efface dateCompletion.
 Le changement persiste après rechargement de la page.
 Le filtre par statut réagit immédiatement.
 Une tâche terminée n’est pas signalée en retard.
 Les autres champs de la tâche restent identiques.
 Un utilisateur ne peut pas modifier la tâche d’un autre.
 Un utilisateur déconnecté ne peut rien modifier.
 Une erreur de stockage est signalée et l’état est restauré.
Répartition entre les deux filières
Informatique	Cybersécurité
Contrôle de statut sur chaque tâche	Vérification de la session avant modification
Style des tâches terminées (police claire, fond atténué)	Vérification que la tâche appartient à l’utilisateur
Mise à jour de la liste et des filtres	Refus des modifications non autorisées
Génération de dateCompletion	Contrôle de cohérence des données avant enregistrement
Modèle d’une tâche (mis à jour)
json
{
  "id": 1,
  "titre": "Réviser le CSS",
  "description": "Flexbox",
  "priorite": "haute",
  "echeance": "2026-11-15",
  "statut": "a_faire",
  "categorieId": 1,
  "dateCreation": "2026-10-30",
  "dateCompletion": null,
  "utilisateurId": 1
}
Champ	Obligatoire	Règle
id	Automatique	Identifiant unique
titre	Oui	Non vide, unique dans le compte de l’utilisateur
description	Non	Texte libre
priorite	Non	basse, moyenne ou haute (null si absente)
echeance	Non	Date AAAA-MM-JJ (null si absente)
statut	Automatique	a_faire par défaut, puis terminee
categorieId	Automatique	« Divers » par défaut, sinon une catégorie de l’utilisateur
dateCreation	Automatique	Générée à la création
dateCompletion	Automatique	null tant que la tâche n’est pas terminée
utilisateurId	Automatique	Récupéré depuis la session
Structure du projet

Elle ne change pas : cette user story ne demande aucun nouveau fichier.

taskflow/
├── index.html
├── style.css      → styles des tâches terminées (police claire, fond atténué)
├── app.js         → logique de changement de statut et de dateCompletion
├── README.md
└── PROMPTS.md     → à compléter avec les prompts de cette user story

Si vous êtes d’accord avec cette version, on peut passer à la user story suivante : supprimer une tâche.

**Gardé: User story terminée

