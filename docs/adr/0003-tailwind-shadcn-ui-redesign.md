# 0003 — Migration vers Tailwind CSS + shadcn/ui

Suite à la demande de redesign UI (CLIENT-BRIEF.md), nous migrons de 641 lignes de CSS vanilla vers Tailwind CSS et shadcn/ui. Ce choix accélère la réécriture des composants, fournit un système de design cohérent (palette, spacing, typographie), et évite de réinventer des patterns de formulaire/carte/badge déjà solutionnés par shadcn. Le trade-off est une dépendance supplémentaire et une courbe d'apprentissage Tailwind pour l'équipe, mais la vitesse d'itération future compense largement.

L'ensemble des pages est migré dans une seule PR (Login, Signup, Dashboard, DossierBuilder, PersonView, TransmissionBuilder, TransmissionView).
