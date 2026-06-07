# PRD : Dossier Locatif

## Problem Statement

Constituer un dossier de location est un processus fastidieux : il faut rassembler des PDFs, retrouver des documents chez des garants qu'on connaît peu, et tout renvoyer à chaque nouvelle candidature. Les candidats n'ont aucun outil centralisé pour organiser, partager et contrôler l'accès à leurs pièces justificatives.

## Solution

Une web app qui permet aux candidats locataires de constituer un dossier documentaire réutilisable, d'inviter garants et co-candidats à contribuer leurs pièces, et de transmettre un sous-ensemble choisi du dossier à des propriétaires ou agences via des liens sécurisés, révocables et limités dans le temps.

## User Stories

1. En tant que **candidat locataire**, je veux créer un compte, afin d'avoir mon propre dossier locatif.

2. En tant que **candidat locataire**, je veux renseigner mes informations personnelles (nom, prénom, email, téléphone, revenus, statut, type de logement), afin de compléter mon profil.

3. En tant que **candidat locataire**, je veux ajouter des documents à mon dossier en les uploadant avec un type prédéfini, afin de centraliser mes pièces justificatives.

4. En tant que **candidat locataire**, je veux ajouter un document de type "Autre" avec un nom personnalisé, afin d'inclure des pièces non standard.

5. En tant que **candidat locataire**, je veux que mes documents soient automatiquement renommés selon le format `Prenom_Nom_Type.ext` au téléchargement, afin qu'ils soient identifiables par le propriétaire.

6. En tant que **candidat locataire**, je veux ajouter un garant à mon dossier en renseignant ses informations (nom, email, statut, etc.) et en uploadant ses documents, afin de constituer son profil dans mon dossier.

7. En tant que **candidat locataire**, je veux ajouter un co-candidat optionnel à mon dossier, afin de postuler à deux sur un même bien.

8. En tant que **candidat locataire**, je veux inviter un garant ou co-candidat via son email, afin qu'il puisse lui-même compléter ses informations et uploader ses documents.

9. En tant que **candidat locataire**, je veux voir sur mon dashboard l'état d'avancement du dossier (documents manquants par personne), afin de savoir ce qu'il reste à faire.

10. En tant que **candidat locataire**, je veux voir sur mon dashboard le statut des invitations envoyées (envoyée / complétée), afin de suivre la contribution des garants et co-candidats.

11. En tant que **candidat locataire**, je veux créer un lien de transmission vers mon dossier, afin de l'envoyer à un propriétaire ou une agence.

12. En tant que **candidat locataire**, je veux choisir quels documents de quelles personnes inclure dans une transmission, afin de contrôler ce que le propriétaire voit.

13. En tant que **candidat locataire**, je veux pouvoir révoquer un lien de transmission à tout moment, afin de couper l'accès au dossier.

14. En tant que **candidat locataire**, je veux définir une date d'expiration sur un lien de transmission, afin de limiter l'accès dans le temps.

15. En tant que **candidat locataire**, je veux voir l'historique de mes transmissions (actives, expirées, révoquées), afin de garder la trace de mes candidatures.

16. En tant que **candidat locataire**, je veux modifier ou supprimer un document de mon dossier, afin de le tenir à jour.

17. En tant que **garant** invité, je veux accéder à ma section du dossier via un lien sécurisé, afin de renseigner mes informations et uploader mes documents.

18. En tant que **co-candidat** invité, je veux accéder à ma section du dossier via un lien sécurisé, afin de renseigner mes informations et uploader mes documents.

19. En tant que **propriétaire ou agence**, je veux accéder à un lien de transmission pour visualiser et télécharger les documents, afin d'évaluer le dossier du candidat.

20. En tant que **candidat locataire**, je veux générer un QR code pour un lien d'invitation ou de transmission, afin de le partager facilement en personne.

21. En tant que **candidat locataire**, je veux configurer les types de documents disponibles, afin de les adapter à différents statuts (étudiant, salarié, etc.).

22. En tant que **candidat locataire**, je veux sélectionner le statut d'une personne pour que les documents requis s'affichent automatiquement, afin de guider la constitution du dossier.

## Implementation Decisions

### Stack technique

- **Backend** : NestJS (TypeScript) — structure modulaire, décorateurs, validation, idéal pour une API REST.
- **ORM** : Prisma — schéma déclaratif, migrations, type-safety, intégration naturelle avec NestJS.
- **Base de données** : PostgreSQL.
- **Frontend** : React 18 + Vite + TypeScript.
- **Stockage fichiers** : AWS S3 (ou compatible, ex. MinIO en dev). Les fichiers uploadés sont stockés et servis depuis S3. Le renommage se fait côté backend avant l'upload (copie avec le bon nom).

### Modules backend

| Module | Rôle |
|--------|------|
| **AuthModule** | Inscription, connexion, sessions JWT |
| **DossierModule** | CRUD du dossier (créé automatiquement à l'inscription) |
| **PersonneModule** | CRUD des personnes liées au dossier |
| **DocumentModule** | Upload vers S3, renommage automatique, suppression, types |
| **InvitationModule** | Génération de tokens d'invitation, validation d'accès |
| **TransmissionModule** | Génération de tokens de transmission, sélection de documents, expiration, révocation |
| **ConfigurationModule** | CRUD des types de documents, statuts, mapping statut→documents |

### Modules frontend

| Module | Rôle |
|--------|------|
| **AuthPages** | Inscription, connexion |
| **Dashboard** | Vue d'ensemble : progression, garants, co-candidats, transmissions |
| **DossierBuilder** | Gestion des personnes + upload de leurs documents (pages combinées) |
| **InvitationManager** | Création/suivi des invitations |
| **TransmissionBuilder** | Création de lien, sélection documents, durée, révocation |
| **PersonView** | Page sécurisée par token pour garant/co-candidat |
| **TransmissionView** | Page sécurisée par token pour propriétaire/agence |

### Sécurité

- Toutes les pages d'invitation et transmission sont sécurisées par un token unique (UUID v4) dans l'URL.
- Les transmissions expirées ou révoquées retournent une erreur 403/410.
- L'authentification du candidat se fait par JWT.
- Les fichiers en S3 ont des URLs signées ou sont servis via le backend avec vérification d'accès.

### Modèle de données (conceptuel)

- **Dossier** (1 par candidat) → lié à un compte candidat
- **Personne** (N par dossier) → rôle (candidat/garant/co-candidat), infos, statut, type logement
- **Document** (N par personne) → type, fichier (clé S3), nom original, métadonnées
- **Invitation** (N par personne) → token, email, statut (envoyée/consultée/complétée)
- **Transmission** (N par dossier) → token, documents inclus, date expiration, révoquée (bool)

## Testing Decisions

### Principes
- Tester le comportement externe, pas l'implémentation.
- Privilégier les tests unitaires pour la logique métier isolable.
- Utiliser des fakes/mocks pour les dépendances externes (S3, base de données).

### Modules testés (priorité haute)

| Module | Type de test | Pourquoi |
|--------|-------------|----------|
| **DocumentModule** | Unitaire | Logique de renommage, validation des types, upload S3 |
| **TransmissionModule** | Unitaire | Logique d'expiration, révocation, sélection de documents |
| **InvitationModule** | Unitaire | Génération de token, validation d'accès, cycle de vie |
| **ConfigurationModule** | Unitaire | Mapping statut→documents, validation |

Tests d'intégration à prévoir plus tard pour les endpoints API complets.

## Out of Scope

- Application mobile native (webapp responsive uniquement).
- Messagerie intégrée entre candidat et propriétaire.
- Signature électronique des baux.
- Paiement en ligne (cautions, frais de dossier).
- Moteur de recherche d'annonces immobilières.
- Version multilingue (français uniquement pour le MVP).
