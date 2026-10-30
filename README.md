# TaskFlow

## Architecture

### Modèle de tâche

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

### structure:

taskflow/
├── index.html
├── style.css
├── app.js
├── README.md
└── PROMPTS.md

### User stories:
US-01: En tant qu'utilisateur connecté, je veux pouvoir créer une nouvelle tâche en renseignant obligatoirement son titre et en personnalisant éventuellement sa description, sa priorité, son échéance et sa catégorie, afin d'organiser mon travail et de suivre les actions que je dois réaliser.
RG-01 — Authentification
- L'utilisateur doit être connecté pour accéder à la création d'une tâche.
- Un utilisateur non connecté ne peut pas créer de tâche.
- Chaque tâche est automatiquement associée à l'utilisateur connecté.

RG-02 — Titre
Nouvelle règle :
- Le titre est obligatoire.
- Un titre vide ou composé uniquement d'espaces est refusé.
- Les espaces inutiles au début et à la fin sont supprimés.
- Deux tâches ne peuvent pas avoir le même titre.
- La comparaison des titres doit être insensible à la casse : « Réviser le CSS » et « réviser le css » sont considérés comme identiques.
La vérification doit empêcher la création d'un doublon.

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

RG-06 — Catégories
- Une catégorie par défaut nommée « Divers » existe dès la création de TaskFlow.
- Toutes les nouvelles tâches sont associées à « Divers » par défaut.
- L'utilisateur peut créer autant de catégories personnalisées qu'il le souhaite.
- Chaque catégorie possède un nom et une couleur.
- L'utilisateur peut modifier le nom et la couleur de ses catégories.
- L'utilisateur peut supprimer ses catégories personnalisées.
- La catégorie « Divers » ne peut pas être supprimée.
- Lorsqu'une catégorie personnalisée est supprimée, les tâches qui lui étaient associées sont réaffectées à « Divers ».

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

US-02: En tant qu’utilisateur connecté, je veux marquer l’une de mes tâches comme terminée (et pouvoir revenir en arrière), afin de visualiser ce qu’il me reste à accomplir et de suivre mon avancement.
RG-01, Authentification et propriété

- Seul un utilisateur connecté peut changer le statut d’une tâche.
- Il ne peut agir que sur ses propres tâches (utilisateurId identique à celui de la session).

RG-02, Passage à « terminée »

- Le statut passe à terminee.
- dateCompletion est générée automatiquement à ce moment-là et ne peut pas être saisie à la main.
- La modification est enregistrée dans localStorage et l’affichage est mis à jour sans recharger la page.

RG-03, Retour en arrière

- Une tâche terminée peut être décochée : elle repasse à a_faire.
- dateCompletion repasse à null.

RG-04, Autres champs inchangés

- Marquer une tâche comme terminée ne modifie ni le titre, ni la description, ni la priorité, ni l’échéance, ni la catégorie.

RG-05, Affichage

- Une tâche terminée reste dans la liste avec un style distinct (texte barré, atténué). L’information ne repose pas sur la couleur seule, pour rester lisible par tous.
- Sa catégorie colorée reste visible.

RG-06, Interaction avec les échéances

- Une tâche terminée n’est jamais signalée comme « en retard », même si son échéance est passée.

RG-07, Interaction avec filtres et tri

- Le filtre par statut tient compte du changement immédiatement : si le filtre « à faire » est actif, la tâche cochée disparaît de la vue.
- Le tri en cours reste appliqué.

RG-08, Unicité des titres

- Une tâche terminée reste prise en compte dans la règle d’unicité : on ne peut pas créer une nouvelle tâche du même titre dans le même compte.

RG-09, Fiabilité

- Si l’enregistrement échoue, l’état affiché revient à l’état précédent et un message d’erreur est affiché.
Un double clic rapide ne doit pas provoquer deux changements d’état successifs.

**Supprimer une tâche : En tant qu’utilisateur, je veux retirer une tâche devenue inutile ou ajoutée par erreur, afin de garder une liste claire et à jour.

**Modifier une tâche : En tant qu’utilisateur, je veux corriger le texte d’une tâche existante, afin de la préciser sans avoir à la recréer.

**Filtrer les tâches : En tant qu’utilisateur, je veux afficher uniquement les tâches à faire, terminées ou toutes, afin de me concentrer sur ce qui compte à un instant donné.

**Conserver mes tâches : En tant qu’utilisateur, je veux retrouver ma liste même après avoir fermé ou rechargé la page, afin de ne pas perdre mon travail.