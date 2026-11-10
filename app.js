// ---------- 1. Constantes ----------
const CLE_TACHES = "taskflow_taches";                   // liste de toutes les tâches
const CLE_CATEGORIES = "taskflow_categories";           // liste de toutes les catégories
const CLE_SESSION = "taskflow_session";                 // utilisateur connecté, ex. {"utilisateurId": 1}
const CLE_DERNIER_ID_TACHE = "taskflow_dernierIdTache"; // compteur : un id n'est jamais réutilisé
const CLE_COMPTE = "taskflow_compte";                     // compte unique du navigateur
const CLE_TENTATIVES = "taskflow_tentativesConnexion";    // échecs et blocage temporaire
const DUREE_BLOCAGE_MS = 15 * 60 * 1000;                   // 15 minutes après 3 échecs
const NOMBRE_MAX_TENTATIVES = 3;
const ITERATIONS_HASH = 120000;
const PRIORITES_AUTORISEES = ["basse", "moyenne", "haute"];
const FILTRES_AUTORISES = ["toutes", "a_faire", "terminee"]; // vues de la liste (US-05)
const NOM_CATEGORIE_DEFAUT = "Divers";
const COULEUR_CATEGORIE_DEFAUT = "#9CA3AF";

// Le Sprint 3 remplace la session temporaire par une connexion explicite.
// Le compte et la session restent simulés côté navigateur (aucun serveur).

// ---------- 2. Fonctions utilitaires ----------
 
// Lit une liste dans le localStorage. Renvoie [] si la clé n'existe pas encore.
function lireListe(cle) {
  const brut = localStorage.getItem(cle);
  if (brut === null) return [];
  const liste = JSON.parse(brut);
  if (!Array.isArray(liste)) {
    throw new Error("Données illisibles : " + cle);
  }
  return liste;
}
 
// Enregistre une liste dans le localStorage (au format texte JSON).
function ecrireListe(cle, liste) {
  localStorage.setItem(cle, JSON.stringify(liste));
}
 
// Renvoie l'id de l'utilisateur connecté, ou null s'il n'y en a pas.
// (La connexion sera gérée par la partie cybersécurité : on lit seulement la session.)
function obtenirUtilisateurConnecte() {
  const brut = localStorage.getItem(CLE_SESSION);
  if (brut === null) return null;
  try {
    const session = JSON.parse(brut);
    return Number.isInteger(session.utilisateurId) ? session.utilisateurId : null;
  } catch (erreur) {
    return null; // session illisible = utilisateur non connecté
  }
}
 
// Renvoie la date du jour au format AAAA-MM-JJ (date locale, pas UTC).
function dateDuJour() {
  const d = new Date();
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mois + "-" + jour;
}
 
// Vérifie qu'un texte est une vraie date AAAA-MM-JJ (refuse "2026-02-30").
function dateValide(texte) {
  if (typeof texte !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(texte)) return false;
  const [annee, mois, jour] = texte.split("-").map(Number);
  const date = new Date(annee, mois - 1, jour);
  return (
    date.getFullYear() === annee &&
    date.getMonth() === mois - 1 &&
    date.getDate() === jour
  );
}
 
// Renvoie l'id de la catégorie « Divers » de l'utilisateur (elle est créée si elle n'existe pas).
function obtenirIdCategorieDivers(utilisateurId) {
  const categories = lireListe(CLE_CATEGORIES);
  const existante = categories.find(
    (c) => c.utilisateurId === utilisateurId && c.parDefaut === true
  );
  if (existante) return existante.id;
 
  const nouvelId = categories.reduce((max, c) => Math.max(max, c.id), 0) + 1;
  categories.push({
    id: nouvelId,
    nom: NOM_CATEGORIE_DEFAUT,
    couleur: COULEUR_CATEGORIE_DEFAUT,
    utilisateurId: utilisateurId,
    parDefaut: true,
  });
  ecrireListe(CLE_CATEGORIES, categories);
  return nouvelId;
}

function ajouterCategorie(nom, couleur) {
  try {
    const utilisateurId = obtenirUtilisateurConnecte();
    if (utilisateurId === null) {
      return { succes: false, erreur: "Vous devez être connecté." };
    }

    const nomNettoye = typeof nom === "string" ? nom.trim() : "";
    if (!nomNettoye) {
      return { succes: false, erreur: "Le nom de la catégorie est obligatoire." };
    }

    if (!/^#[0-9a-f]{6}$/i.test(couleur)) {
      return { succes: false, erreur: "La couleur choisie est invalide." };
    }

    const categories = lireListe(CLE_CATEGORIES);
    const doublon = categories.some(
      (c) =>
        c.utilisateurId === utilisateurId &&
        c.nom.toLocaleLowerCase("fr") === nomNettoye.toLocaleLowerCase("fr")
    );

    if (doublon) {
      return { succes: false, erreur: "Cette catégorie existe déjà." };
    }

    const id = categories.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const categorie = {
      id,
      nom: nomNettoye,
      couleur,
      utilisateurId,
      parDefaut: false,
    };

    categories.push(categorie);
    ecrireListe(CLE_CATEGORIES, categories);

    return { succes: true, categorie, message: "Catégorie créée." };
  } catch (erreur) {
    return { succes: false, erreur: "Impossible d'enregistrer la catégorie." };
  }
}

function modifierCategorie(categorieId, nom, couleur) {
  try {
    const utilisateurId = obtenirUtilisateurConnecte();
    if (utilisateurId === null) {
      return { succes: false, erreur: "Vous devez être connecté." };
    }

    const id = Number(categorieId);
    const nomNettoye = typeof nom === "string" ? nom.trim() : "";

    if (!nomNettoye || !/^#[0-9a-f]{6}$/i.test(couleur)) {
      return { succes: false, erreur: "Nom ou couleur invalide." };
    }

    const categories = lireListe(CLE_CATEGORIES);
    const categorie = categories.find(
      (c) => c.id === id && c.utilisateurId === utilisateurId
    );

    if (!categorie) {
      return { succes: false, erreur: "Catégorie introuvable." };
    }

    const doublon = categories.some(
      (c) =>
        c.id !== id &&
        c.utilisateurId === utilisateurId &&
        c.nom.toLocaleLowerCase("fr") === nomNettoye.toLocaleLowerCase("fr")
    );

    if (doublon) {
      return { succes: false, erreur: "Cette catégorie existe déjà." };
    }

    categorie.nom = nomNettoye;
    categorie.couleur = couleur;
    ecrireListe(CLE_CATEGORIES, categories);

    return { succes: true, message: "Catégorie modifiée." };
  } catch (erreur) {
    return { succes: false, erreur: "Impossible de modifier la catégorie." };
  }
}

function supprimerCategorie(categorieId) {
  try {
    const utilisateurId = obtenirUtilisateurConnecte();
    if (utilisateurId === null) {
      return { succes: false, erreur: "Vous devez être connecté." };
    }

    const id = Number(categorieId);
    const categories = lireListe(CLE_CATEGORIES);
    const categorie = categories.find(
      (c) => c.id === id && c.utilisateurId === utilisateurId
    );

    if (!categorie) {
      return { succes: false, erreur: "Catégorie introuvable." };
    }

    if (categorie.parDefaut) {
      return { succes: false, erreur: "La catégorie Divers ne peut pas être supprimée." };
    }

    const idDivers = obtenirIdCategorieDivers(utilisateurId);
    const taches = lireListe(CLE_TACHES);

    taches.forEach((tache) => {
      if (tache.utilisateurId === utilisateurId && tache.categorieId === id) {
        tache.categorieId = idDivers;
      }
    });

    ecrireListe(CLE_TACHES, taches);
    ecrireListe(
      CLE_CATEGORIES,
      categories.filter((c) => c.id !== id)
    );

    return { succes: true, message: "Catégorie supprimée. Ses tâches sont dans Divers." };
  } catch (erreur) {
    return { succes: false, erreur: "Impossible de supprimer la catégorie." };
  }
}
 
// ---------- 3. Fonction principale : ajouter une tâche ----------
// donnees = { titre, description, priorite, echeance, categorieId } (tout sauf titre est facultatif)
// Renvoie { succes: true, tache, message } ou { succes: false, erreur }.
function ajouterTache(donnees) {
  donnees = donnees || {};
 
  try {
    // RG-01 : il faut être connecté, et l'utilisateur vient de la session (jamais du formulaire)
    const utilisateurId = obtenirUtilisateurConnecte();
    if (utilisateurId === null) {
      return { succes: false, erreur: "Vous devez être connecté pour créer une tâche." };
    }
 
    // RG-02 : le titre est obligatoire, sans espaces inutiles au début et à la fin
    const titre = typeof donnees.titre === "string" ? donnees.titre.trim() : "";
    if (titre === "") {
      return { succes: false, erreur: "Le titre est obligatoire." };
    }
 
    // RG-02 : pas deux tâches de même titre dans le même compte (insensible à la casse)
    const taches = lireListe(CLE_TACHES);
    const titreComparable = titre.toLocaleLowerCase("fr");
    const doublon = taches.some(
      (t) =>
        t.utilisateurId === utilisateurId &&
        t.titre.toLocaleLowerCase("fr") === titreComparable
    );
    if (doublon) {
      return { succes: false, erreur: "Une tâche avec ce titre existe déjà." };
    }
 
    // RG-03 : description facultative
    const description =
      typeof donnees.description === "string" ? donnees.description.trim() : "";
 
    // RG-04 : priorité facultative (null si absente), sinon basse / moyenne / haute
    let priorite = donnees.priorite;
    if (priorite === undefined || priorite === "") priorite = null;
    if (priorite !== null && !PRIORITES_AUTORISEES.includes(priorite)) {
      return { succes: false, erreur: "La priorité doit être basse, moyenne ou haute." };
    }
 
    // RG-05 : échéance facultative (null si absente), format AAAA-MM-JJ, une date passée est acceptée
    let echeance = donnees.echeance;
    if (echeance === undefined || echeance === "") echeance = null;
    if (echeance !== null && !dateValide(echeance)) {
      return { succes: false, erreur: "L'échéance doit être une date valide (AAAA-MM-JJ)." };
    }
 
    // RG-06 : sans catégorie choisie => « Divers » ; sinon la catégorie doit appartenir à l'utilisateur
    let categorieId;
    if (
      donnees.categorieId === undefined ||
      donnees.categorieId === null ||
      donnees.categorieId === ""
    ) {
      categorieId = obtenirIdCategorieDivers(utilisateurId);
    } else {
      categorieId = Number(donnees.categorieId);
      const categories = lireListe(CLE_CATEGORIES);
      const categorieValide = categories.some(
        (c) => c.id === categorieId && c.utilisateurId === utilisateurId
      );
      if (!categorieValide) {
        return { succes: false, erreur: "Cette catégorie n'existe pas." };
      }
    }
 
    // RG-09 : id unique, jamais réutilisé (compteur séparé de la liste des tâches)
    const dernierId = Number(localStorage.getItem(CLE_DERNIER_ID_TACHE)) || 0;
    const plusGrandId = taches.reduce((max, t) => Math.max(max, t.id), 0);
    const nouvelId = Math.max(dernierId, plusGrandId) + 1;
 
    // RG-07 et RG-08 : date de création et statut générés par l'application
    const tache = {
      id: nouvelId,
      titre: titre,
      description: description,
      priorite: priorite,
      echeance: echeance,
      statut: "a_faire",
      categorieId: categorieId,
      dateCreation: dateDuJour(),
      dateCompletion: null,
      utilisateurId: utilisateurId,
    };
 
    // RG-09 : enregistrement (le compteur d'abord, pour ne jamais réutiliser un id)
    localStorage.setItem(CLE_DERNIER_ID_TACHE, String(nouvelId));
    taches.push(tache);
    ecrireListe(CLE_TACHES, taches);
 
    return { succes: true, tache: tache, message: "Tâche « " + titre + " » créée avec succès." };
  } catch (erreur) {
    // localStorage plein, bloqué ou contenant des données illisibles
    return {
      succes: false,
      erreur: "Impossible d'enregistrer la tâche : le stockage local est indisponible ou illisible.",
    };
  }
}

// ---------- 4. Marquer une tâche comme terminée (US-02) ----------
// tacheId   = id de la tâche (nombre, ou texte venant du HTML comme "3")
// terminee  = true pour cocher, false pour décocher (la valeur vient de l'état de la case à cocher)
// Renvoie { succes: true, tache, message } ou { succes: false, erreur }.
// On passe l'état voulu (et non « inverser ») pour qu'un double clic rapide ne change rien
// la 2e fois : demander deux fois « terminée » donne le même résultat (RG-09).
function changerStatutTache(tacheId, terminee) {
  try {
    // RG-01 : il faut être connecté
    const utilisateurId = obtenirUtilisateurConnecte();
    if (utilisateurId === null) {
      return { succes: false, erreur: "Vous devez être connecté pour modifier une tâche." };
    }
 
    // On vérifie les paramètres reçus : un id entier et un vrai booléen
    const id = Number(tacheId);
    if (!Number.isInteger(id) || typeof terminee !== "boolean") {
      return { succes: false, erreur: "Demande invalide." };
    }
 
    // On relit la liste à chaque appel : si la tâche a été supprimée depuis un autre onglet,
    // on le détecte ici (cas « Tâche supprimée entre-temps »)
    const taches = lireListe(CLE_TACHES);
    const tache = taches.find((t) => t.id === id);
 
    // RG-01 : seul le propriétaire peut agir. Même message pour « inconnue » et « pas à moi »,
    // afin de ne pas révéler l'existence des tâches des autres utilisateurs.
    if (!tache || tache.utilisateurId !== utilisateurId) {
      return { succes: false, erreur: "Tâche introuvable ou modification non autorisée." };
    }
 
    // Déjà dans l'état demandé : rien à changer (double clic), on ne touche pas à dateCompletion
    const statutVoulu = terminee ? "terminee" : "a_faire";
    if (tache.statut === statutVoulu) {
      return { succes: true, tache: tache, message: "Aucun changement : la tâche était déjà dans cet état." };
    }
 
    // RG-02 / RG-03 : seuls statut et dateCompletion changent (RG-04 : le reste est intact)
    tache.statut = statutVoulu;
    tache.dateCompletion = terminee ? dateDuJour() : null;
 
    // RG-02 : enregistrement. Si l'écriture échoue, on passe dans le catch : le stockage
    // n'a pas été modifié, donc l'interface doit se remettre dans l'état précédent (RG-09).
    ecrireListe(CLE_TACHES, taches);
 
    return {
      succes: true,
      tache: tache,
      message: terminee
        ? "Tâche « " + tache.titre + " » marquée comme terminée."
        : "Tâche « " + tache.titre + " » remise à faire.",
    };
  } catch (erreur) {
    return {
      succes: false,
      erreur: "Impossible d'enregistrer le changement : le stockage local est indisponible ou illisible.",
    };
  }
}

// ---------- 5. Supprimer une tâche (US-03) ----------
// Ids déjà retirés pendant cette visite de la page.
// Un double clic sur Confirmer rappelle la fonction : la 2e fois la tâche n'existe plus,
// mais ce n'est pas une erreur (RG-09). Une suppression faite depuis un autre onglet,
// elle, n'est pas dans cet ensemble : on signale alors que la tâche a disparu.
const idsSupprimesCetteSession = new Set();

// tacheId   = id de la tâche (nombre, ou texte venant du HTML comme "3")
// confirme  = true seulement après un « oui » explicite de l'utilisateur.
//             L'interface doit d'abord afficher une confirmation qui rappelle le titre.
//             Annuler = appeler avec confirme à false, ou ne pas appeler du tout.
// Renvoie { succes: true, tache, message, listeVide } ou { succes: false, erreur }
//         ou { succes: false, annulee: true, message } si l'utilisateur a annulé.
function supprimerTache(tacheId, confirme) {
  try {
    // RG-01 : il faut être connecté
    const utilisateurId = obtenirUtilisateurConnecte();
    if (utilisateurId === null) {
      return { succes: false, erreur: "Vous devez être connecté pour supprimer une tâche." };
    }

    // RG-02 : sans confirmation explicite, on ne supprime rien (annuler n'est pas une erreur)
    if (confirme !== true) {
      return {
        succes: false,
        annulee: true,
        message: "Suppression annulée. La tâche est conservée.",
      };
    }

    const id = Number(tacheId);
    if (!Number.isInteger(id)) {
      return { succes: false, erreur: "Demande invalide." };
    }

    // On relit la liste à chaque appel (autre onglet, ou 2e clic sur Confirmer)
    const taches = lireListe(CLE_TACHES);
    const index = taches.findIndex((t) => t.id === id);

    if (index === -1) {
      // RG-09 : le premier clic a déjà supprimé la tâche, le second ne doit pas échouer
      if (idsSupprimesCetteSession.has(id)) {
        const encore = taches.some((t) => t.utilisateurId === utilisateurId);
        return {
          succes: true,
          message: "Cette tâche est déjà supprimée.",
          listeVide: !encore,
        };
      }
      return { succes: false, erreur: "Tâche introuvable ou suppression non autorisée." };
    }

    const tache = taches[index];

    // RG-01 : seul le propriétaire peut supprimer. Même message si la tâche
    // appartient à quelqu'un d'autre, pour ne pas révéler qu'elle existe.
    if (tache.utilisateurId !== utilisateurId) {
      return { succes: false, erreur: "Tâche introuvable ou suppression non autorisée." };
    }

    // RG-03 : on retire uniquement cette tâche.
    // RG-06 : les catégories ne sont pas modifiées.
    // RG-07 : CLE_DERNIER_ID_TACHE n'est pas diminué, l'id ne sera jamais réattribué.
    // RG-05 : le titre redevient disponible, puisqu'il n'est plus dans la liste.
    const restantes = taches.filter((t) => t.id !== id);
    ecrireListe(CLE_TACHES, restantes);
    idsSupprimesCetteSession.add(id);

    // RG-08 : l'interface s'en sert pour afficher « aucune tâche » si besoin.
    // Les filtres, le tri et la recherche restent gérés à l'affichage.
    const listeVide = !restantes.some((t) => t.utilisateurId === utilisateurId);

    return {
      succes: true,
      tache: tache,
      message: "Tâche « " + tache.titre + " » supprimée.",
      listeVide: listeVide,
    };
  } catch (erreur) {
    // Si l'écriture échoue, la liste d'origine est encore dans le localStorage (RG-09)
    return {
      succes: false,
      erreur: "Impossible d'enregistrer la suppression : le stockage local est indisponible ou illisible.",
    };
  }
}

// ---------- 6. Modifier une tâche (US-04) ----------
// tacheId = id de la tâche à corriger (nombre, ou texte venant du HTML comme "3")
// donnees = { titre, description, priorite, echeance, categorieId }
//   Un champ absent (undefined) n'est pas touché : on garde la valeur actuelle.
//   Un champ envoyé vide ("") efface description, priorité ou échéance.
//   Une catégorie vide est ramenée à « Divers ».
// On ne modifie jamais id, dateCreation, utilisateurId, statut, dateCompletion.
// Renvoie { succes: true, tache, message } ou { succes: false, erreur }.
function modifierTache(tacheId, donnees) {
  // Si on appelle modifierTache(3) sans second argument, donnees vaut undefined.
  // Le || le remplace par {} pour pouvoir lire donnees.titre sans planter.
  donnees = donnees || {};

  try {
    // RG-01 : même contrôle que pour cocher ou supprimer. L'id utilisateur
    // vient de la session, jamais du formulaire.
    const utilisateurId = obtenirUtilisateurConnecte();
    if (utilisateurId === null) {
      return { succes: false, erreur: "Vous devez être connecté pour modifier une tâche." };
    }

    // Number("3") vaut 3. Number("abc") vaut NaN, qui n'est pas un entier.
    const id = Number(tacheId);
    if (!Number.isInteger(id)) {
      return { succes: false, erreur: "Demande invalide." };
    }

    // Relecture à chaque appel : une suppression dans un autre onglet est visible ici.
    const taches = lireListe(CLE_TACHES);
    // find renvoie l'objet tâche, ou undefined s'il n'y a aucun id correspondant.
    const tache = taches.find((t) => t.id === id);

    // Tâche absente et tâche d'un autre compte : le même message, pour ne pas
    // indiquer que la tâche de l'autre utilisateur existe.
    if (!tache || tache.utilisateurId !== utilisateurId) {
      return { succes: false, erreur: "Tâche introuvable ou modification non autorisée." };
    }

    // --- Titre ---
    // undefined : le formulaire n'a pas envoyé de titre, on conserve l'ancien.
    // Sinon on reprend la règle de création : obligatoire, espaces coupés, unique
    // dans le compte. La tâche en cours est exclue du test (t.id !== id), sinon
    // enregistrer sans changer le titre serait refusé comme doublon d'elle-même.
    let titre = tache.titre;
    if (donnees.titre !== undefined) {
      titre = typeof donnees.titre === "string" ? donnees.titre.trim() : "";
      if (titre === "") {
        return { succes: false, erreur: "Le titre est obligatoire." };
      }

      const titreComparable = titre.toLocaleLowerCase("fr");
      const doublon = taches.some(
        (t) =>
          t.id !== id &&
          t.utilisateurId === utilisateurId &&
          typeof t.titre === "string" &&
          t.titre.toLocaleLowerCase("fr") === titreComparable
      );
      if (doublon) {
        return { succes: false, erreur: "Une tâche avec ce titre existe déjà." };
      }
    }

    // --- Description ---
    // undefined : on garde. "" ou un non-texte : description vidée.
    // trim retire les espaces au début et à la fin.
    let description = tache.description;
    if (donnees.description !== undefined) {
      description = typeof donnees.description === "string" ? donnees.description.trim() : "";
    }

    // --- Priorité ---
    // undefined : on garde. "" ou null : plus de priorité.
    // Toute autre valeur doit être basse, moyenne ou haute.
    let priorite = tache.priorite;
    if (donnees.priorite !== undefined) {
      priorite = donnees.priorite;
      if (priorite === "" || priorite === null) priorite = null;
      if (priorite !== null && !PRIORITES_AUTORISEES.includes(priorite)) {
        return { succes: false, erreur: "La priorité doit être basse, moyenne ou haute." };
      }
    }

    // --- Échéance ---
    // undefined : on garde. "" ou null : plus d'échéance.
    // Une date passée reste acceptée. "2026-02-30" est refusée par dateValide.
    let echeance = tache.echeance;
    if (donnees.echeance !== undefined) {
      echeance = donnees.echeance;
      if (echeance === "" || echeance === null) echeance = null;
      if (echeance !== null && !dateValide(echeance)) {
        return { succes: false, erreur: "L'échéance doit être une date valide (AAAA-MM-JJ)." };
      }
    }

    // --- Catégorie ---
    // undefined : on garde la catégorie actuelle.
    // null ou "" : retour à « Divers » (créée pour cet utilisateur si besoin).
    // un id : il doit exister et appartenir à l'utilisateur connecté.
    let categorieId = tache.categorieId;
    if (donnees.categorieId === null || donnees.categorieId === "") {
      categorieId = obtenirIdCategorieDivers(utilisateurId);
    } else if (donnees.categorieId !== undefined) {
      categorieId = Number(donnees.categorieId);
      const categories = lireListe(CLE_CATEGORIES);
      const categorieValide = categories.some(
        (c) => c.id === categorieId && c.utilisateurId === utilisateurId
      );
      if (!categorieValide) {
        return { succes: false, erreur: "Cette catégorie n'existe pas." };
      }
    }

    // Rien n'a changé (second clic sur Enregistrer) : on ne réécrit pas le stockage.
    const identique =
      tache.titre === titre &&
      tache.description === description &&
      tache.priorite === priorite &&
      tache.echeance === echeance &&
      tache.categorieId === categorieId;
    if (identique) {
      return {
        succes: true,
        tache: tache,
        message: "Aucun changement : la tâche était déjà à jour.",
      };
    }

    // On écrit seulement les champs saisis. statut et dateCompletion restent
    // ceux fixés par changerStatutTache. id, dateCreation et utilisateurId
    // restent ceux fixés par ajouterTache.
    tache.titre = titre;
    tache.description = description;
    tache.priorite = priorite;
    tache.echeance = echeance;
    tache.categorieId = categorieId;

    // tache est déjà l'élément du tableau taches : ecrireListe enregistre le tout.
    // Si setItem échoue, l'ancienne liste est encore dans le localStorage.
    ecrireListe(CLE_TACHES, taches);

    return {
      succes: true,
      tache: tache,
      message: "Tâche « " + tache.titre + " » modifiée.",
    };
  } catch (erreur) {
    return {
      succes: false,
      erreur: "Impossible d'enregistrer la modification : le stockage local est indisponible ou illisible.",
    };
  }
}

// ---------- 7. Filtrer les tâches (US-05) ----------
// filtre = "toutes", "a_faire" ou "terminee".
//          Absent, null ou "" veut dire "toutes".
// Cette fonction ne modifie pas le localStorage : elle prépare seulement
// la liste à afficher. Après un cochage, une suppression ou une modification,
// l'interface rappelle filtrerTaches avec le même filtre.
// Renvoie { succes: true, taches, filtre, listeVide, total, message }
//      ou { succes: false, erreur }.
function filtrerTaches(filtre) {
  try {
    // Même garde que les autres fonctions : sans session, pas de liste.
    // On ne renvoie jamais les tâches d'un autre compte.
    const utilisateurId = obtenirUtilisateurConnecte();
    if (utilisateurId === null) {
      return { succes: false, erreur: "Vous devez être connecté pour voir vos tâches." };
    }

    // Valeur demandée. Si l'interface n'a encore rien choisi, on montre tout.
    let demande = filtre;
    if (demande === undefined || demande === null || demande === "") {
      demande = "toutes";
    }

    // " A_FAIRE " devient "a_faire". Un texte inconnu ("en_cours", "retard") est refusé.
    if (typeof demande !== "string") {
      return { succes: false, erreur: "Le filtre doit être toutes, a_faire ou terminee." };
    }
    demande = demande.trim().toLocaleLowerCase("fr");
    if (!FILTRES_AUTORISES.includes(demande)) {
      return { succes: false, erreur: "Le filtre doit être toutes, a_faire ou terminee." };
    }

    // Relecture complète, puis on ne garde que les tâches du compte connecté.
    const taches = lireListe(CLE_TACHES);
    const miennes = taches.filter((t) => t.utilisateurId === utilisateurId);

    // "toutes" garde miennes. Les deux autres ne gardent qu'un statut.
    // filter construit un nouveau tableau : l'ordre d'enregistrement est conservé.
    const visibles =
      demande === "toutes" ? miennes : miennes.filter((t) => t.statut === demande);

    // Liste vraiment vide, ou seulement vide pour ce filtre.
    // L'interface affiche ce message au lieu d'un écran blanc.
    let message;
    if (visibles.length === 0 && miennes.length === 0) {
      message = "Aucune tâche pour le moment.";
    } else if (visibles.length === 0) {
      message = "Aucune tâche ne correspond à ce filtre.";
    } else if (visibles.length === 1) {
      message = "1 tâche affichée.";
    } else {
      message = visibles.length + " tâches affichées.";
    }

    return {
      succes: true,
      taches: visibles,
      filtre: demande,
      listeVide: visibles.length === 0,
      total: miennes.length,
      message: message,
    };
  } catch (erreur) {
    return {
      succes: false,
      erreur: "Impossible de lire les tâches : le stockage local est indisponible ou illisible.",
    };
  }
}

// ---------- 8. Retrouver les tâches (US-06) ----------
// Aucun paramètre. À appeler au chargement de la page.
// L'enregistrement a déjà eu lieu : ajouterTache, changerStatutTache,
// modifierTache et supprimerTache passent par ecrireListe, qui écrit
// dans le localStorage. Fermer ou recharger la page ne vide pas ce stockage.
// Cette fonction se contente de le relire.
// Renvoie { succes: true, taches, categories, listeVide, message }
//      ou { succes: false, erreur }.
function retrouverTaches() {
  try {
    // Sans session, on ne charge pas la liste : elle appartient à un compte.
    const utilisateurId = obtenirUtilisateurConnecte();
    if (utilisateurId === null) {
      return { succes: false, erreur: "Vous devez être connecté pour retrouver vos tâches." };
    }

    // lireListe renvoie [] si la clé n'existe pas encore (première visite).
    // filter ne garde que les objets de l'utilisateur connecté.
    const taches = lireListe(CLE_TACHES).filter((t) => t.utilisateurId === utilisateurId);

    // Les catégories suivent les tâches : sans elles, le nom et la couleur
    // seraient perdus à l'affichage après un rechargement.
    const categories = lireListe(CLE_CATEGORIES).filter(
      (c) => c.utilisateurId === utilisateurId
    );

    // Le compteur d'id est déjà dans le localStorage (CLE_DERNIER_ID_TACHE).
    // On ne le relit pas ici : ajouterTache s'en sert au prochain ajout,
    // donc un id supprimé avant le rechargement ne sera pas réutilisé.

    let message;
    if (taches.length === 0) {
      message = "Aucune tâche enregistrée.";
    } else if (taches.length === 1) {
      message = "1 tâche retrouvée.";
    } else {
      message = taches.length + " tâches retrouvées.";
    }

    return {
      succes: true,
      taches: taches,
      categories: categories,
      listeVide: taches.length === 0,
      message: message,
    };
  } catch (erreur) {
    // JSON illisible ou localStorage bloqué. On ne supprime rien :
    // une lecture ratée ne doit pas effacer la liste.
    return {
      succes: false,
      erreur: "Impossible de retrouver les tâches : le stockage local est indisponible ou illisible.",
    };
  }
}

// ---------- 9. Authentification simulée (Sprint 3) ----------
function lireCompteUnique() {
  const brut = localStorage.getItem(CLE_COMPTE);
  if (brut === null) return null;
  try {
    const compte = JSON.parse(brut);
    if (
      compte && compte.id === 1 && typeof compte.identifiant === "string" &&
      typeof compte.sel === "string" && typeof compte.motDePasseHash === "string"
    ) return compte;
    return null;
  } catch (erreur) {
    return null;
  }
}

function verifierRobustesseMotDePasse(motDePasse) {
  const criteres = {
    longueur: typeof motDePasse === "string" && motDePasse.length >= 8,
    majuscule: typeof motDePasse === "string" && /[A-Z]/.test(motDePasse),
    chiffre: typeof motDePasse === "string" && /[0-9]/.test(motDePasse),
    special: typeof motDePasse === "string" && /[^A-Za-z0-9]/.test(motDePasse),
  };
  return { ...criteres, valide: Object.values(criteres).every(Boolean) };
}

function evaluerForceMotDePasse(motDePasse) {
  if (!motDePasse) return { score: 0, niveau: "non évaluée" };
  let score = 0;
  if (motDePasse.length >= 8) score++;
  if (motDePasse.length >= 12) score++;
  if (/[A-Z]/.test(motDePasse) && /[a-z]/.test(motDePasse)) score++;
  if (/[0-9]/.test(motDePasse)) score++;
  if (/[^A-Za-z0-9]/.test(motDePasse)) score++;
  return {
    score,
    niveau: score <= 2 ? "faible" : score <= 4 ? "moyen" : "fort",
  };
}

async function calculerHashMotDePasse(motDePasse, selHex) {
  if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
    throw new Error("Le navigateur ne permet pas le calcul sécurisé du mot de passe. Ouvre TaskFlow dans un navigateur récent via localhost ou HTTPS.");
  }
  const sel = new Uint8Array(selHex.match(/.{1,2}/g).map((octet) => parseInt(octet, 16)));
  const donnees = new TextEncoder().encode(motDePasse);
  const cle = await crypto.subtle.importKey("raw", donnees, "PBKDF2", false, ["deriveBits"]);
  const derive = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: sel, iterations: ITERATIONS_HASH, hash: "SHA-256" },
    cle,
    256
  );
  return Array.from(new Uint8Array(derive), (octet) => octet.toString(16).padStart(2, "0")).join("");
}

function creerSelAleatoire() {
  const octets = new Uint8Array(16);
  crypto.getRandomValues(octets);
  return Array.from(octets, (octet) => octet.toString(16).padStart(2, "0")).join("");
}

function lireEtatTentatives() {
  try {
    const brut = localStorage.getItem(CLE_TENTATIVES);
    if (!brut) return { echecs: 0, bloqueJusqua: 0 };
    const etat = JSON.parse(brut);
    return {
      echecs: Number.isInteger(etat.echecs) && etat.echecs >= 0 ? etat.echecs : 0,
      bloqueJusqua: Number.isFinite(etat.bloqueJusqua) ? etat.bloqueJusqua : 0,
    };
  } catch (erreur) {
    return { echecs: 0, bloqueJusqua: 0 };
  }
}

function enregistrerEchecConnexion() {
  const etat = lireEtatTentatives();
  const maintenant = Date.now();
  if (etat.bloqueJusqua && maintenant >= etat.bloqueJusqua) {
    etat.echecs = 0;
    etat.bloqueJusqua = 0;
  }
  etat.echecs++;
  if (etat.echecs >= NOMBRE_MAX_TENTATIVES) {
    etat.echecs = 0;
    etat.bloqueJusqua = maintenant + DUREE_BLOCAGE_MS;
  }
  localStorage.setItem(CLE_TENTATIVES, JSON.stringify(etat));
  return etat;
}

function reinitialiserTentativesConnexion() {
  localStorage.removeItem(CLE_TENTATIVES);
}

function tempsRestantBlocage() {
  const etat = lireEtatTentatives();
  return Math.max(0, etat.bloqueJusqua - Date.now());
}

function formaterTempsRestant(ms) {
  const minutes = Math.ceil(ms / 60000);
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const authContainer = document.getElementById("auth-container");
  const taskApp = document.getElementById("task-app");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const authTitle = document.getElementById("auth-title");
  const authDescription = document.getElementById("auth-description");
  const loginMessage = document.getElementById("login-message");
  const registerMessage = document.getElementById("register-message");
  const accountActions = document.getElementById("account-actions");
  const connectedUser = document.getElementById("connected-user");
  const logoutButton = document.getElementById("logout-button");
  const passwordInput = document.getElementById("register-password");
  const strengthFill = document.getElementById("strength-fill");
  const strengthLabel = document.getElementById("strength-label");
  const form = document.getElementById("task-form");
  const liste = document.getElementById("task-list");
  const compteur = document.getElementById("task-count");
  const message = document.getElementById("form-error");
  const selectFiltre = document.getElementById("task-filter");
  const selectTri = document.getElementById("task-sort");
  const selectCategorie = document.getElementById("categorieId");
  const formulaireCategorie = document.getElementById("category-form");
  const listeCategories = document.getElementById("category-list");
  const boutonEnvoyer = document.getElementById("submit-button");
  const boutonAnnuler = document.getElementById("cancel-edit");
  const titreFormulaire = document.getElementById("form-title");

  let tacheEnCoursId = null;

  function afficherMessageAuth(element, texte, erreur = true) {
    element.textContent = texte;
    element.className = erreur
      ? "form-message error-message"
      : "form-message success-message";
    element.hidden = false;
  }

  function actualiserEcranAuthentification() {
    const compte = lireCompteUnique();
    const utilisateurId = obtenirUtilisateurConnecte();
    const connecte = utilisateurId === 1 && compte !== null;

    authContainer.hidden = connecte;
    taskApp.hidden = !connecte;
    accountActions.hidden = !connecte;

    if (connecte) {
      connectedUser.textContent = compte.identifiant;
      afficherCategories();
      afficherTaches();
      return;
    }

    const inscriptionNecessaire = compte === null;
    loginForm.hidden = inscriptionNecessaire;
    registerForm.hidden = !inscriptionNecessaire;
    authTitle.textContent = inscriptionNecessaire ? "Créer ton compte" : "Content de te revoir";
    authDescription.textContent = inscriptionNecessaire
      ? "Configure le compte unique qui sera utilisé pour accéder à TaskFlow."
      : "Connecte-toi pour retrouver tes tâches.";
    accountActions.hidden = true;
  }

  function afficherMessage(texte, erreur = true) {
    message.textContent = texte;
    message.className = erreur
      ? "form-message error-message"
      : "form-message success-message";
    message.hidden = false;
  }

  function creerBouton(texte, action, id, classe) {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = classe;
    bouton.textContent = texte;
    bouton.dataset.action = action;
    bouton.dataset.id = id;
    return bouton;
  }

  function obtenirCategoriesUtilisateur() {
    const utilisateurId = obtenirUtilisateurConnecte();
    if (utilisateurId === null) return [];

    obtenirIdCategorieDivers(utilisateurId);
    return lireListe(CLE_CATEGORIES).filter(
      (categorie) => categorie.utilisateurId === utilisateurId
    );
  }

  function afficherCategories() {
    try {
      const categories = obtenirCategoriesUtilisateur().sort(
  (a, b) => Number(b.parDefaut) - Number(a.parDefaut)
);
      const selectionActuelle = selectCategorie.value;

      selectCategorie.replaceChildren();
      listeCategories.replaceChildren();

      categories.forEach((categorie) => {
        const option = document.createElement("option");
        option.value = categorie.id;
        option.textContent = categorie.nom;
        selectCategorie.append(option);

        const element = document.createElement("li");
        element.append(document.createTextNode(`${categorie.nom} `));

        const boutonModifier = creerBouton(
          "Modifier",
          "modifier-categorie",
          categorie.id,
          "button button-secondary button-small"
        );

        const boutonSupprimer = creerBouton(
          "Supprimer",
          "supprimer-categorie",
          categorie.id,
          "button button-danger button-small"
        );
        boutonSupprimer.disabled = categorie.parDefaut;

        element.append(boutonModifier, boutonSupprimer);
        listeCategories.append(element);
      });

      if (categories.some((categorie) => String(categorie.id) === selectionActuelle)) {
        selectCategorie.value = selectionActuelle;
      }
    } catch (erreur) {
      afficherMessage("Impossible de charger les catégories.");
    }
  }

  function afficherTaches() {
    const resultat = filtrerTaches(selectFiltre.value);

    if (!resultat.succes) {
      liste.replaceChildren();
      compteur.textContent = "0";
      afficherMessage(resultat.erreur);
      return;
    }

    const tachesAffichees = [...resultat.taches];

    if (selectTri.value === "priorite") {
      const ordrePriorite = { haute: 0, moyenne: 1, basse: 2 };

      tachesAffichees.sort((a, b) => {
        const prioriteA = ordrePriorite[a.priorite] ?? 3;
        const prioriteB = ordrePriorite[b.priorite] ?? 3;
        return prioriteA - prioriteB;
      });
    } else if (selectTri.value === "echeance") {
      tachesAffichees.sort((a, b) => {
        if (!a.echeance) return b.echeance ? 1 : 0;
        if (!b.echeance) return -1;
        return a.echeance.localeCompare(b.echeance);
      });
    }

    compteur.textContent = tachesAffichees.length;
    liste.replaceChildren();

    if (tachesAffichees.length === 0) {
      const vide = document.createElement("div");
      vide.className = "empty-state";

      const titre = document.createElement("h3");
      const texte = document.createElement("p");

      if (resultat.total === 0) {
        titre.textContent = "Aucune tâche pour le moment";
        texte.textContent =
          "Commence par ajouter ta première tâche avec le formulaire ci-dessus.";
      } else {
        titre.textContent = "Aucune tâche pour ce filtre";
        texte.textContent = "Essaie un autre filtre pour voir tes tâches.";
      }

      vide.append(titre, texte);
      liste.append(vide);
      return;
    }

    const categories = obtenirCategoriesUtilisateur();
    const categoriesParId = new Map(
      categories.map((categorie) => [categorie.id, categorie])
    );

    tachesAffichees.forEach((tache) => {
      const carte = document.createElement("article");
      carte.className = "task-card";

      if (tache.statut === "terminee") {
        carte.classList.add("task-completed");
      }

      const caseTerminee = document.createElement("input");
      caseTerminee.type = "checkbox";
      caseTerminee.className = "task-check";
      caseTerminee.checked = tache.statut === "terminee";
      caseTerminee.dataset.action = "toggle";
      caseTerminee.dataset.id = tache.id;
      caseTerminee.setAttribute("aria-label", `Terminer ${tache.titre}`);

      const contenu = document.createElement("div");
      contenu.className = "task-content";

      const titre = document.createElement("h3");
      titre.className = "task-title";
      titre.textContent = tache.titre;
      contenu.append(titre);

      if (tache.description) {
        const description = document.createElement("p");
        description.className = "task-description";
        description.textContent = tache.description;
        contenu.append(description);
      }

      const metadonnees = document.createElement("div");
      metadonnees.className = "task-meta";

      if (tache.priorite) {
        const priorite = document.createElement("span");
        priorite.className = `meta-chip priority-${tache.priorite}`;
        priorite.textContent = `Priorité ${tache.priorite}`;
        metadonnees.append(priorite);
      }

      if (tache.echeance) {
        const echeance = document.createElement("span");
        echeance.className = "meta-chip";
        echeance.textContent = `Échéance : ${tache.echeance}`;
        metadonnees.append(echeance);
      }

      const categorie = categoriesParId.get(tache.categorieId);
      if (categorie) {
        const etiquetteCategorie = document.createElement("span");
        etiquetteCategorie.className = "meta-chip";
        etiquetteCategorie.textContent = categorie.nom;
        etiquetteCategorie.style.border = `1px solid ${categorie.couleur}`;
        metadonnees.append(etiquetteCategorie);
      }

      if (tache.statut === "terminee") {
        const statut = document.createElement("span");
        statut.className = "meta-chip status-chip";
        statut.textContent = "Terminée";
        metadonnees.append(statut);
      }

      if (metadonnees.childElementCount > 0) {
        contenu.append(metadonnees);
      }

      const actions = document.createElement("div");
      actions.className = "task-actions";
      actions.append(
        creerBouton(
          "Modifier",
          "edit",
          tache.id,
          "button button-secondary button-small"
        ),
        creerBouton(
          "Supprimer",
          "delete",
          tache.id,
          "button button-danger button-small"
        )
      );
      contenu.append(actions);

      carte.append(caseTerminee, contenu);
      liste.append(carte);
    });
  }

  function annulerModification() {
    tacheEnCoursId = null;
    form.reset();
    boutonAnnuler.hidden = true;
    boutonEnvoyer.textContent = "＋ Ajouter la tâche";
    titreFormulaire.textContent = "Ajouter une tâche";
  }

  // Première ouverture : création du compte unique. Les ouvertures suivantes affichent la connexion.
  passwordInput.addEventListener("input", () => {
    const motDePasse = passwordInput.value;
    const force = evaluerForceMotDePasse(motDePasse);
    const criteres = verifierRobustesseMotDePasse(motDePasse);
    const scoreAffiche = Math.min(force.score, 5);
    strengthFill.style.width = `${scoreAffiche * 20}%`;
    strengthFill.dataset.level = force.niveau;
    strengthLabel.textContent = `Force : ${force.niveau}`;
    document.getElementById("rule-length").classList.toggle("valid", criteres.longueur);
    document.getElementById("rule-uppercase").classList.toggle("valid", criteres.majuscule);
    document.getElementById("rule-number").classList.toggle("valid", criteres.chiffre);
    document.getElementById("rule-special").classList.toggle("valid", criteres.special);
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    registerMessage.hidden = true;
    if (lireCompteUnique() !== null) {
      afficherMessageAuth(registerMessage, "Un compte existe déjà dans ce navigateur. Connecte-toi.");
      actualiserEcranAuthentification();
      return;
    }

    const identifiant = registerForm.elements.identifiant.value.trim();
    const motDePasse = registerForm.elements.motDePasse.value;
    const confirmation = registerForm.elements.confirmation.value;
    if (!identifiant) {
      afficherMessageAuth(registerMessage, "L'identifiant est obligatoire.");
      return;
    }
    if (!verifierRobustesseMotDePasse(motDePasse).valide) {
      afficherMessageAuth(registerMessage, "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.");
      return;
    }
    if (motDePasse !== confirmation) {
      afficherMessageAuth(registerMessage, "Les deux mots de passe ne correspondent pas.");
      return;
    }

    try {
      const sel = creerSelAleatoire();
      const motDePasseHash = await calculerHashMotDePasse(motDePasse, sel);
      const compte = { id: 1, identifiant, sel, motDePasseHash, iterations: ITERATIONS_HASH };
      localStorage.setItem(CLE_COMPTE, JSON.stringify(compte));
      localStorage.setItem(CLE_SESSION, JSON.stringify({ utilisateurId: 1, identifiant }));
      reinitialiserTentativesConnexion();
      registerForm.reset();
      passwordInput.dispatchEvent(new Event("input"));
      actualiserEcranAuthentification();
    } catch (erreur) {
      afficherMessageAuth(registerMessage, erreur.message || "Impossible de créer le compte dans le stockage local.");
    }
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginMessage.hidden = true;

    const blocageRestant = tempsRestantBlocage();
    if (blocageRestant > 0) {
      afficherMessageAuth(loginMessage, `Trop de tentatives échouées. Réessaie dans ${formaterTempsRestant(blocageRestant)}.`);
      return;
    }

    const compte = lireCompteUnique();
    const identifiant = loginForm.elements.identifiant.value.trim();
    const motDePasse = loginForm.elements.motDePasse.value;
    if (!compte) {
      actualiserEcranAuthentification();
      return;
    }

    try {
      const identifiantValide = identifiant.toLocaleLowerCase("fr") === compte.identifiant.toLocaleLowerCase("fr");
      const hashSaisi = await calculerHashMotDePasse(motDePasse, compte.sel);
      const hashValide = hashSaisi.length === compte.motDePasseHash.length &&
        [...hashSaisi].reduce((different, caractere, index) => different | (caractere.charCodeAt(0) ^ compte.motDePasseHash.charCodeAt(index)), 0) === 0;

      if (!identifiantValide || !hashValide) {
        const etat = enregistrerEchecConnexion();
        if (etat.bloqueJusqua > Date.now()) {
          afficherMessageAuth(loginMessage, "Trois tentatives échouées : l'accès est bloqué pendant 15 minutes.");
        } else {
          const restantes = NOMBRE_MAX_TENTATIVES - etat.echecs;
          afficherMessageAuth(loginMessage, `Identifiant ou mot de passe incorrect. Il reste ${restantes} tentative${restantes > 1 ? "s" : ""}.`);
        }
        return;
      }

      reinitialiserTentativesConnexion();
      localStorage.setItem(CLE_SESSION, JSON.stringify({ utilisateurId: 1, identifiant: compte.identifiant }));
      loginForm.reset();
      actualiserEcranAuthentification();
    } catch (erreur) {
      afficherMessageAuth(loginMessage, erreur.message || "Impossible de vérifier le mot de passe.");
    }
  });

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem(CLE_SESSION);
    if (tacheEnCoursId !== null) annulerModification();
    loginForm.reset();
    loginMessage.hidden = true;
    actualiserEcranAuthentification();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const donnees = Object.fromEntries(new FormData(form).entries());
    const modification = tacheEnCoursId !== null;
    const resultat = modification
      ? modifierTache(tacheEnCoursId, donnees)
      : ajouterTache(donnees);

    if (!resultat.succes) {
      afficherMessage(resultat.erreur);
      return;
    }

    annulerModification();
    afficherCategories();
    afficherTaches();
    afficherMessage(resultat.message, false);
  });

  liste.addEventListener("change", (event) => {
    const cible = event.target;

    if (!(cible instanceof HTMLInputElement) || cible.dataset.action !== "toggle") {
      return;
    }

    const resultat = changerStatutTache(cible.dataset.id, cible.checked);
    afficherTaches();
    afficherMessage(
      resultat.succes ? resultat.message : resultat.erreur,
      !resultat.succes
    );
  });

  liste.addEventListener("click", (event) => {
    const cible = event.target;
    if (!(cible instanceof Element)) return;

    const bouton = cible.closest("button[data-action]");
    if (!bouton) return;

    const id = bouton.dataset.id;

    if (bouton.dataset.action === "edit") {
      try {
        const tache = lireListe(CLE_TACHES).find(
          (element) => String(element.id) === id
        );

        if (!tache) {
          afficherMessage("Cette tâche est introuvable.");
          afficherTaches();
          return;
        }

        tacheEnCoursId = tache.id;
        form.elements.titre.value = tache.titre;
        form.elements.description.value = tache.description || "";
        form.elements.priorite.value = tache.priorite || "";
        form.elements.echeance.value = tache.echeance || "";
        form.elements.categorieId.value = String(tache.categorieId);

        boutonAnnuler.hidden = false;
        boutonEnvoyer.textContent = "Enregistrer les modifications";
        titreFormulaire.textContent = "Modifier une tâche";
        form.elements.titre.focus();
      } catch (erreur) {
        afficherMessage("Impossible de charger cette tâche.");
      }
      return;
    }

    if (bouton.dataset.action === "delete") {
      try {
        const tache = lireListe(CLE_TACHES).find(
          (element) => String(element.id) === id
        );

        if (!tache || !window.confirm(`Supprimer la tâche « ${tache.titre} » ?`)) {
          return;
        }

        const resultat = supprimerTache(id, true);

        if (resultat.succes) {
          if (tacheEnCoursId === Number(id)) {
            annulerModification();
          }
          afficherTaches();
        }

        afficherMessage(
          resultat.succes ? resultat.message : resultat.erreur,
          !resultat.succes
        );
      } catch (erreur) {
        afficherMessage("Impossible de supprimer cette tâche.");
      }
    }
  });

  formulaireCategorie.addEventListener("submit", (event) => {
    event.preventDefault();

    const donnees = new FormData(formulaireCategorie);
    const resultat = ajouterCategorie(
      donnees.get("nom"),
      donnees.get("couleur")
    );

    if (!resultat.succes) {
      afficherMessage(resultat.erreur);
      return;
    }

    formulaireCategorie.reset();
    afficherCategories();
    afficherMessage(resultat.message, false);
  });

  listeCategories.addEventListener("click", (event) => {
    const cible = event.target;
    if (!(cible instanceof Element)) return;

    const bouton = cible.closest("button[data-action]");
    if (!bouton) return;

    const id = bouton.dataset.id;

    try {
      const categorie = lireListe(CLE_CATEGORIES).find(
        (element) => String(element.id) === id
      );

      if (!categorie) {
        afficherMessage("Cette catégorie est introuvable.");
        afficherCategories();
        return;
      }

      let resultat;

      if (bouton.dataset.action === "modifier-categorie") {
        const nom = window.prompt("Nom de la catégorie :", categorie.nom);
        if (nom === null) return;

        const couleur = window.prompt(
          "Couleur au format #RRGGBB :",
          categorie.couleur
        );
        if (couleur === null) return;

        resultat = modifierCategorie(id, nom, couleur);
      } else if (bouton.dataset.action === "supprimer-categorie") {
        if (!window.confirm(`Supprimer « ${categorie.nom} » ?`)) return;
        resultat = supprimerCategorie(id);
      } else {
        return;
      }

      if (resultat.succes) {
        afficherCategories();
        afficherTaches();
      }

      afficherMessage(
        resultat.succes ? resultat.message : resultat.erreur,
        !resultat.succes
      );
    } catch (erreur) {
      afficherMessage("Impossible de modifier cette catégorie.");
    }
  });

  boutonAnnuler.addEventListener("click", annulerModification);
  selectFiltre.addEventListener("change", afficherTaches);
  selectTri.addEventListener("change", afficherTaches);

  actualiserEcranAuthentification();
});
