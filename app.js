// ---------- 1. Constantes ----------
const CLE_TACHES = "taskflow_taches";                   // liste de toutes les tâches
const CLE_CATEGORIES = "taskflow_categories";           // liste de toutes les catégories
const CLE_SESSION = "taskflow_session";                 // utilisateur connecté, ex. {"utilisateurId": 1}
const CLE_DERNIER_ID_TACHE = "taskflow_dernierIdTache"; // compteur : un id n'est jamais réutilisé
const PRIORITES_AUTORISEES = ["basse", "moyenne", "haute"];
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

