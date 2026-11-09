// ---------- 1. Constantes ----------
const CLE_TACHES = "taskflow_taches";                   // liste de toutes les tâches
const CLE_CATEGORIES = "taskflow_categories";           // liste de toutes les catégories
const CLE_SESSION = "taskflow_session";                 // utilisateur connecté, ex. {"utilisateurId": 1}
const CLE_DERNIER_ID_TACHE = "taskflow_dernierIdTache"; // compteur : un id n'est jamais réutilisé
const PRIORITES_AUTORISEES = ["basse", "moyenne", "haute"];
const FILTRES_AUTORISES = ["toutes", "a_faire", "terminee"]; // vues de la liste (US-05)
const NOM_CATEGORIE_DEFAUT = "Divers";
const COULEUR_CATEGORIE_DEFAUT = "#9CA3AF";
 
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

