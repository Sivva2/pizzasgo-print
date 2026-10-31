# PizzasGo Print

Application Android pour terminal Sunmi V2. Interroge le site WooCommerce et imprime
automatiquement chaque nouvelle commande.

## Fonctionnement

L'app interroge `GET /orders/pending` toutes les 10 secondes. Chaque commande non encore
traitée est mise en page puis imprimée, et l'app appelle `POST /orders/{id}/printed`
seulement après impression réussie. Une commande qui échoue trois fois est abandonnée
pour ne pas bloquer la file.

Côté site, le plugin `pizzasgo-print-bridge` expose les trois points d'entrée.

## Installation

```bash
npm install
cp src/config.example.ts src/config.ts
```

Renseigner `token` dans `src/config.ts` avec le jeton affiché dans
WooCommerce → Impression Sunmi.

Ce fichier est ignoré par git : le jeton donne accès aux commandes et aux coordonnées
des clients, il ne doit jamais être commité.

## Build

Nécessite le JDK 17 et le SDK Android.

```bash
cd android
./gradlew assembleRelease
```

APK produit dans `android/app/build/outputs/apk/release/app-release.apk`.

## Terminal

À régler sur la Sunmi après installation :

- écran qui ne s'éteint pas
- optimisation de batterie désactivée pour l'app
- fuseau horaire sur Europe/Paris, l'heure du ticket en dépend

## Structure

| Fichier | Rôle |
| --- | --- |
| `src/api.ts` | Appels REST, jeton en en-tête, timeout |
| `src/ticket.ts` | Mise en page du ticket sur 32 caractères |
| `src/printer.ts` | Pilotage de l'imprimante Sunmi |
| `src/usePrintQueue.ts` | Boucle de polling et file d'impression |
| `scripts/preview.ts` | Aperçu du ticket en console, sans matériel |

## Aperçu du ticket

```bash
node --experimental-strip-types scripts/preview.ts
```
