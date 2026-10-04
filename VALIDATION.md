# Validation mathématique — étape 1

Les cinq jeux ci-dessous sont inclus dans le sélecteur d’exemples et dans `tests.js`.

| Cas | Matrice des gains `(A ; B)` | Résultat attendu |
|---|---|---|
| Stratégie dominante | `((4;3),(4;1)); ((2;2),(2;0))` | A1 domine strictement A2, B1 domine strictement B2 ; unique Nash : A1/B1. |
| Point-selle | `((3;-3),(1;-1)); ((2;-2),(2;-2))` | Somme nulle ; maximin = minimax = 2 ; point-selle A2/B2. |
| Mixte à somme nulle | `((1;-1),(-1;1)); ((-1;1),(1;-1))` | Aucun Nash pur ; A1 et B1 sont jouées à 50 % ; valeur 0 pour les deux. |
| Jeu général de coordination | `((4;4),(0;0)); ((0;0),(3;3))` | Deux Nash purs : coordonner A/A et B/B ; équilibre mixte intérieur : première stratégie à 3/7 (≈42,86 %) chacun. |
| Nature | `((1;0),(8;0)); ((5;0),(3;0))`, pluie 1/3, soleil 2/3 | Espérance Sortir = 17/3 ≈5,667 ; Rester = 11/3 ≈3,667 ; choisir Sortir. |

Exécution automatisée : le moteur a été exécuté contre ces cinq assertions ; elles passent toutes. L’environnement ne fournit pas de commande `node` en terminal, mais les tests ont été exécutés dans le runtime JavaScript intégré.

## Limite volontaire de cette version

L’interface et les algorithmes décisionnels sont volontairement limités à deux acteurs et deux options. Le format du jeu garde toutefois les joueurs, leurs listes de stratégies et les gains séparés : il n’impose pas la somme nulle. L’étape 2 devra remplacer l’accès matriciel 2×2 du moteur par l’énumération des profils de stratégies, sans modifier le format conceptuel des gains.
