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

En tant qu'utilisateur connecté, je veux pouvoir créer une nouvelle tâche en renseignant obligatoirement son titre et en personnalisant éventuellement sa description, sa priorité, son échéance et sa catégorie, afin d'organiser mon travail et de suivre les actions que je dois réaliser.