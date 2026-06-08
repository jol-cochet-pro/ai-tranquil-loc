# Design Plan — Refonte UI Dossier Locatif

## 1. Vue d'ensemble

Refonte complète de l'interface utilisateur : nouvelle barre de navigation structurée en onglets, dashboard enrichi, pages dédiées aux candidats/garants, formulaire multi-étapes pour la création de personnes, et simplification de la création de transmissions.

## 2. Changements backend

### 2.1 Schéma Prisma — Ajout du rôle sur Personne

```prisma
enum Role {
  candidat
  co_candidat
  garant
}

model Personne {
  // ... champs existants
  role      Role    @default(candidat)
  // ...
}
```

### 2.2 Création auto du candidat à l'inscription

`AuthService.register()` crée une `Personne` avec `role: candidat` en même temps que le `Dossier`.

### 2.3 Endpoints API

| Méthode | Route | Changement |
|---|---|---|
| `POST /personnes` | Création | Ajout champ `role` requis dans `CreatePersonneDto` |
| `PATCH /personnes/:id` | Édition | Aucun changement majeur |
| `GET /personnes` | Liste | Retourne toutes les personnes + leur rôle. Le front filtre par rôle. |
| `POST /invitations` | Création | Inchangé (lie une invitation à une personne existante) |

### 2.4 Endpoint complétion pour le dashboard

Nouvel endpoint `GET /personnes/completion` qui retourne pour chaque personne du dossier :
- `personneId`, `nom`, `prenom`, `role`
- `documentsCount` / `documentsRequired` (selon statut)
- `invitationStatus` (pending / viewed / completed)

## 3. Changements frontend

### 3.1 Nouveau routage

| Route | Page | Auth |
|---|---|---|
| `/login` | Login | Non |
| `/signup` | Signup | Non |
| `/dashboard` | Dashboard | Oui |
| `/candidats` | PersonList (rôle: candidat + co_candidat) | Oui |
| `/candidats/creer` | Wizard (rôle: co_candidat) | Oui |
| `/candidats/:id` | Wizard (édition) | Oui |
| `/garants` | PersonList (rôle: garant) | Oui |
| `/garants/creer` | Wizard (rôle: garant) | Oui |
| `/garants/:id` | Wizard (édition) | Oui |
| `/transmissions` | TransmissionList | Oui |
| `/parametres` | Settings | Oui |
| `/invitation/:token` | PersonEdit (invité) | Non |

**Supprimer** : `/dossier` (ancienne page monolithique).

### 3.2 AppLayout — Nouvelle barre de navigation

- **Desktop** : barre horizontale en haut avec onglets (Dashboard, Candidats, Garants, Transmissions) + dropdown Profil à droite (Paramètres, Déconnexion).
- **Mobile** : menu hamburger avec les mêmes entrées.
- Les pages publiques (`/login`, `/signup`, `/invitation/:token`) utilisent un layout sans barre de navigation.

### 3.3 Page Dashboard

Widgets :
- **Complétion des profils** : pour chaque personne (co-candidats + garants), affiche nom, rôle, progression X/Y documents, couleur (rouge/orange/vert), clic → redirige vers l'onglet correspondant.
- **Invitations** : liste des invitations avec statut (badge) + bouton copier lien.
- **Transmissions** : liste des transmissions avec couleur d'expiration + bouton copier lien + statut.

### 3.4 Page PersonList (Candidats / Garants)

Composant réutilisable paramétré par `role` :
- Liste des personnes du rôle concerné.
- Pour "Candidats" : la personne `role: candidat` est affichée en premier avec un label "Moi".
- Chaque ligne : nom, email, statut, progression documents, actions (Modifier, Inviter, Supprimer).
- Bouton "Créer un co-candidat" ou "Créer un garant" → navigue vers le wizard.

### 3.5 Wizard — Formulaire multi-étapes

Composant réutilisable (StepperForm) avec 4 étapes :

| Étape | Contenu | Validation |
|---|---|---|
| **1. Infos personnelles** | Nom, prénom, email, téléphone | Champs requis |
| **2. Infos professionnelles** | Statut (select), type logement (select), revenus | Statut requis |
| **3. Documents** | Liste des types requis selon statut+rôle. Chaque ligne : icône état + input file (auto-upload) ou lien téléchargement + bouton supprimer | Aucune (on peut créer sans documents) |
| **4. Récapitulatif** | Résumé de toutes les données, boutons Annuler / Retour / Créer | — |

Navigation : boutons "Suivant", "Précédent", numéro d'étape visible. Données conservées en mémoire (React state) jusqu'à la validation finale.

**Mode édition** : même wizard, pré-rempli avec les données existantes de la personne. Bouton final → "Enregistrer".

### 3.6 Page PersonEdit (invitation `/invitation/:token`)

Réutilise le même composant `StepperForm` en mode édition :
- Charge les données de la personne via le `personneId` de l'invitation.
- Affiche le wizard pré-rempli.
- Permet de modifier/ajouter des données et uploader/supprimer des documents.
- Bouton final → "Enregistrer les modifications".

### 3.7 Page TransmissionList

- **Créer une transmission** : sélection durée d'expiration, accordéon par personne listant tous ses documents (tous cochés par défaut), bouton "Créer le lien" → lien généré et copié.
- **Liste des transmissions** : tableau avec token, date création, date expiration, statut (actif/expiré/révoqué), boutons copier lien et révoquer.
- Filtres pour naviguer entre transmissions actives, expirées, révoquées.

### 3.8 Page Settings

Formulaire simple : changement d'email + changement de mot de passe (avec confirmation). Bouton Déconnexion.

## 4. Ordre d'implémentation proposé

### Phase 1 — Fondation (backend + routage)
1. Migration Prisma : ajout champ `role` sur `Personne`, création de l'enum
2. Mise à jour `AuthService` : création auto de la Personne candidat à l'inscription
3. Mise à jour DTOs, contrôleur, service Personne
4. Nouvel endpoint `GET /personnes/completion`
5. Création du `AppLayout` avec barre de navigation
6. Mise à jour du routing (suppression `/dossier`, ajout des nouvelles routes)

### Phase 2 — Pages d'onglets (sans le wizard)
7. Page Dashboard (widgets)
8. Page PersonList (réutilisable, paramétrée par rôle)
9. Page TransmissionList (création + liste)
10. Page Settings

### Phase 3 — Wizard
11. Composant StepperForm (4 étapes)
12. Étape 1 : Infos personnelles
13. Étape 2 : Infos professionnelles
14. Étape 3 : Documents (liste inputs + auto-upload)
15. Étape 4 : Récapitulatif
16. Intégration création personne + invitation
17. Mode édition (pré-remplissage)

### Phase 4 — Invitation
18. Adaptation de `PersonView` → réutilisation du StepperForm en mode édition
19. Lien pré-remplissage des données existantes depuis l'invitation

## 5. Questions résiduelles

- [ ] Doit-on archiver/supprimer les données de l'ancienne page `/dossier` ou la migration est transparente ?
- [ ] Les transmissions : y a-t-il des transmissions existantes en base à migrer avec le nouveau format ?
