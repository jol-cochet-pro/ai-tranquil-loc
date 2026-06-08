# Dossier Locatif

Application pour aider les candidats locataires à constituer, organiser et partager leur dossier de location.

## Language

**Candidat locataire**:
Personne qui constitue un dossier de location pour postuler à un bien locatif.
_Avoid_ : Locataire, tenant, applicant

**Dossier**:
Ensemble des pièces justificatives et informations personnelles d'un candidat locataire, réutilisable pour postuler à différents biens.
_Avoid_ : Candidature, application

**Garant**:
Personne qui s'engage financièrement à couvrir le loyer en cas de défaillance du candidat locataire.
_Avoid_ : Garant moral, répondant

**Co-candidat**:
Personne qui postule avec le candidat locataire principal et fournit ses propres pièces dans le même dossier. Optionnel.
_Avoid_ : Futur locataire, colocataire

**Document**:
Fichier (PDF, image) associé à un type de pièce justificative et à une personne (candidat, garant ou co-candidat).
_Avoid_ : Fichier, pièce

**Rôle**:
Qualité d'une personne dans le dossier : `candidat`, `co_candidat` ou `garant`. Le candidat est le titulaire du dossier. Le co-candidat postule avec lui. Le garant s'engage financièrement.
_Avoid_ : Type de personne, catégorie

**Personne**:
Individu associé à un dossier, caractérisé par un **rôle** (candidat, co-candidat ou garant). Chaque personne a un nom, prénom, email, téléphone, revenus, un statut (Étudiant, Salarié...), un type de logement (locataire, propriétaire, hébergé) et une collection de documents.
_Avoid_ : Utilisateur, membre, compte

**Invitation**:
Lien envoyé à un garant ou co-candidat pour qu'il puisse accéder au dossier et contribuer ses documents. Visibilité restreinte à sa propre section. Seul le candidat principal voit l'ensemble du dossier.
_Avoid_ : Partage interne, contribution

**Transmission**:
Lien envoyé à un propriétaire ou une agence pour visualiser un sous-ensemble de documents choisi par le candidat. Peut être limité dans le temps ou révocable.
_Avoid_ : Partage externe, envoi
