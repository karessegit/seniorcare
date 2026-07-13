Applique ces règles à CHAQUE composant que tu écris ou modifies. En cas de doute entre deux
approches, choisis toujours celle qui respecte le point ci-dessous le plus proche du conflit.


1. CE QUE TU DOIS FAIRE (obligatoire, sans exception)

A. Heuristiques de Nielsen (vues en cours — à appliquer littéralement)


Visibility of system status : chaque action (envoi de formulaire, sauvegarde, chargement,
confirmation SOS) doit produire un retour visuel immédiat (spinner, message de confirmation,
changement d'état du bouton). Aucune action silencieuse.
Match between system and the real world : utilise un vocabulaire courant, pas de jargon
technique. Les libellés doivent rester ceux validés dans le prototype (Medikamente, Termine,
SOS-Notruf, etc.).
User control and freedom : chaque flux (ajout de médicament, de rendez-vous, inscription)
doit avoir une sortie de secours claire — bouton "Abbrechen"/"Zurück" visible sur CHAQUE écran
secondaire, sans exception.
Consistency and standards : un composant réutilisable par fonction (ex. un seul composant
<BackButton />, un seul composant <ConfirmDialog />) réutilisé partout — jamais deux styles
différents pour la même fonction.
Error prevention : privilégie la désactivation/masquage des actions invalides plutôt que
des messages d'erreur après coup (ex. bouton "hinzufügen" désactivé tant que les champs
obligatoires ne sont pas remplis).
Recognition rather than recall : n'exige jamais que l'utilisateur se souvienne d'une info
déjà saisie ailleurs. Affiche toujours le contexte (ex. le nom du senior visible en permanence
sur les écrans caregiver).
Aesthetic and minimalist design : un écran = une tâche principale. N'ajoute pas d'éléments
qui ne servent pas l'action en cours.
Help users recognize, diagnose, and recover from errors : messages d'erreur en langage
naturel ("Bitte gib eine gültige E-Mail-Adresse ein"), jamais de code d'erreur brut.


B. Loi de proximité (Gestaltgesetz der Nähe, vue en cours)


"Benachbarte Elemente werden als zusammengehörig wahrgenommen" — des éléments proches sont
perçus comme liés, même s'ils sont différents.




Le bouton SOS-Notruf doit être physiquement séparé (marge visible, conteneur distinct,
pas de bordure commune) de tout champ de texte. Ne les mets JAMAIS dans le même <div>/card.
Applique ce principe partout : regroupe visuellement uniquement ce qui appartient à la même
action logique.


C. Principes cognitifs (Sharp/Preece/Rogers, vus en cours)


Aufmerksamkeit (attention) : utilise la couleur/animation seulement pour attirer l'attention
sur ce qui est réellement prioritaire à l'instant T (ex. médicament en retard). Ne surcharge pas
l'écran d'accents visuels concurrents.
Wahrnehmung (perception) : icônes graphiquement claires, séparateurs et espaces blancs
entre les blocs, peu de couleurs mais utilisées avec un fort contraste, feedback visuel
systématique après chaque interaction.
Gedächtnis (mémoire) : pas de procédures longues ou compliquées ; favorise la reconnaissance
(icônes + labels visibles) plutôt que le rappel (pas de code à retenir, pas d'étape cachée).
Lernen (apprentissage) : le comportement d'un composant doit être identique partout où il
apparaît, pour que l'utilisateur apprenne une seule fois comment interagir avec l'app.


D. "User Interface: Dos and Don'ts" (slides Prof. Zander — à appliquer mot pour mot)


Ne communique pas trop : n'affiche pas d'informations triviales ou évidentes.
Concentre chaque écran sur l'objectif d'une seule décision.
Inspire confiance : n'affiche pas d'avertissements excessifs ou d'alertes non justifiées.
Respecte le temps de l'utilisateur : réponses rapides, pas de chargement inutile.
Sois spécifique, explicite et utile dans chaque texte d'interface.
L'utilisateur ne doit jamais avoir l'impression d'expérimenter ou de devoir réfléchir aux
conséquences d'une action avant de la faire.
Donne des explications suffisantes, sans surcharger — reste concis.


E. Les 8 caractéristiques essentielles d'un bon UI (à vérifier pour chaque écran)

Pour chaque écran livré, vérifie explicitement (et commente dans le code si besoin) :


Discoverability — le point de départ d'une action est facilement trouvable
Understandability — l'utilisateur décide sans devoir expérimenter
Affordance — l'apparence d'un élément indique clairement comment interagir avec lui
Predictability — pas de surprise dans le résultat d'une action
Efficiency — effort minimal pour atteindre le but
Responsive Feedback — retour immédiat et clair après toute action
Forgiveness — les erreurs sont récupérables (Undo, confirmation avant suppression)
Explorability — l'utilisateur peut explorer sans crainte de "casser" quelque chose


F. Exigences techniques du Meilenstein #3 (grille de notation)


React 19+ (obligatoire pour la meilleure note ; v16+ = minimum accepté)
Code commenté clairement, avec l'auteur de chaque section si travail en équipe
Respect strict de ce qui a été validé aux Meilensteine #1 et #2 (personas, user-flows,
wireframes) — le prof vérifie explicitement que "Die Ergebnisse der ersten beiden
Meilensteine sind mit eingeflossen"
Application responsive et fonctionnelle sur plusieurs appareils
Une README.md obligatoire avec installation, architecture, et Release Notes
(dates, changements, responsabilités) — sans ça, pas de notation individuelle possible
N'inclus jamais node_modules dans les livrables



2. CE QUE TU NE DOIS SURTOUT PAS FAIRE


❌ Ne place jamais le bouton SOS dans le même bloc visuel qu'un champ de saisie de texte,
même si fonctionnellement ils sont indépendants — la simple proximité visuelle suffit à créer
une ambiguïté dangereuse (violation directe de la loi de proximité + error prevention).
❌ N'exige aucune saisie de texte obligatoire avant de pouvoir déclencher le SOS.
❌ Ne supprime jamais un élément (médicament, rendez-vous) sans un dialogue de confirmation
explicite (violation de "User control and freedom" et de "Forgiveness").
❌ N'utilise pas de texte gris clair sur fond clair, ni pour les placeholders, ni pour les
états secondaires ("noch nicht eingenommen", etc.) — respecte un contraste WCAG AA minimum
(ratio ≥ 4.5:1), même si ce n'est pas nommé explicitement dans le cours, cela découle
directement du principe "Wahrnehmung : setze wenige Farben kontrastreich ein".
❌ Ne crée pas d'écrans avec des boutons/icônes non fonctionnels (ex. l'écran Gym du
prototype où les icônes n'étaient pas cliquables) — chaque élément visible doit être
fonctionnel, sinon supprime-le ou marque-le clairement comme "à venir".
❌ Ne duplique pas la même information sous deux formes différentes sur un même écran
(ex. les boutons "Medikamente"/"Termine" du dashboard caregiver ne doivent pas répéter ce que
montre déjà "Aktivitäten heute") — viole le principe "aesthetic and minimalist design".
❌ Ne rends pas obligatoire le remplissage d'un long formulaire en une seule fois pour
l'inscription Senior — répartis en étapes ou simplifie, pour respecter les principes cognitifs
(limiter la charge de mémoire et la fatigue).
❌ Ne code jamais deux comportements différents pour la même fonction visuelle à deux
endroits de l'app (ex. un bouton retour qui agit différemment selon l'écran) — viole
"Consistency and standards".
❌ Ne push jamais de composant sans retour visuel après une action (pas de bouton
"silencieux" qui ne change pas d'état après un clic) — viole "Visibility of system status" et
"Responsive Feedback".
❌ N'inclus pas node_modules ni de gros datasets (>200MB) dans les livrables — indique
plutôt dans le README comment les obtenir.



3. FORMAT DE TRAVAIL ATTENDU


Avant d'implémenter un écran, vérifie-le mentalement contre les 8 caractéristiques (section 1E)
et contre la liste des interdits (section 2). Si un point coince, corrige AVANT de continuer.
Ajoute un commentaire court dans le code chaque fois qu'une décision de design découle
directement d'un principe du cours, au format :
// HCI: Nielsen - Error Prevention (bouton désactivé tant que le formulaire est incomplet)
// HCI: Gestalt - Loi de proximité (SOS isolé du champ texte)
Ces commentaires me serviront directement à justifier les choix dans le rapport du Meilenstein #3.
Si une exigence de ce document contredit une décision déjà prise dans le code existant,
signale-le clairement avant de la corriger, plutôt que de la modifier silencieusement.


police a utiliser 
Applique la charte typographique suivante à l'ensemble du frontend SeniorCare+ :

POLICE
- Police principale : "Atkinson Hyperlegible" (via Google Fonts ou @fontsource),
  avec fallback système : -apple-system, "Segoe UI", Roboto, sans-serif
- Ne jamais utiliser de graisse "light" ou "thin" — utiliser au minimum "regular" (400),
  et "bold" (700) pour les éléments prioritaires (montants, heures, noms de médicaments)
- Bannir toute police décorative/display pour les titres — cohérence et lisibilité
  priment sur l'esthétique

TAILLES (à définir comme variables Tailwind config, pas de valeurs codées en dur)
- text-base (corps de texte) : 18px, line-height 1.5
- text-lg (infos importantes : heure, nom médicament) : 20px, line-height 1.5
- text-xl (titres d'écran H1) : 26px, line-height 1.3, bold
- text-sos (bouton SOS uniquement) : 24px, bold, letter-spacing 0.02em
- Boutons standards : 20px minimum, jamais en dessous
- Labels de formulaire / texte secondaire : 16px minimum (jamais moins, même pour les
  placeholders ou le texte "discret")

RÈGLES
- Ces tailles s'appliquent uniquement à l'espace Senior. L'espace Caregiver peut utiliser
  des tailles standards (14-16px) sauf pour les alertes/statuts critiques du senior suivi.
- Centralise ces valeurs dans le fichier de config Tailwind (theme.extend.fontSize) et dans
  un composant Typography réutilisable, pas de tailles inline dispersées dans les composants.
- Vérifie que le contraste texte/fond reste conforme WCAG AA à chaque taille définie.