# DPS Minsanté — téléconsultation mobile

Application mobile (React Native / Expo) de pré-consultation et d'orientation vers un médecin,
pensée pour le Cameroun. Le patient répond à un questionnaire court ; selon ses réponses,
l'application l'oriente vers la surveillance à domicile, un avis médical ou les urgences, puis
lui permet d'envoyer son dossier à un médecin.

## Ce que fait la V1

- Questionnaire de triage (9 questions) : symptôme principal, durée, intensité, fièvre, signes
  d'alerte, antécédents, âge.
- Moteur d'orientation : `urgence` / `avis médical conseillé` / `surveillance`, avec conseils
  adaptés.
- Annuaire de médecins (données de démonstration, Cameroun) filtrable par spécialité.
- Envoi d'une demande de consultation avec le résumé du triage.
- Espace médecin (file d'attente, priorité).
- Compte local, historique des demandes, profil.

Volontairement hors périmètre pour l'instant : paiement, visio, ordonnance. La visio est annoncée
dans l'interface mais désactivée.

## Stack

- Expo SDK 58 / React Native 0.88 / TypeScript
- expo-router (navigation par fichiers)
- AsyncStorage (persistance locale)
- Supabase optionnel (Postgres + Auth + Storage) — `supabase/schema.sql`

## Lancer le projet

```bash
npm install
npx expo start
```

Scanner le QR code avec Expo Go (Android/iOS). Pour tester sur navigateur : `npx expo start --web`.

## Activer Supabase (optionnel)

1. Créer un projet sur supabase.com, exécuter `supabase/schema.sql` dans le SQL Editor.
2. Renseigner les variables :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Sans ces variables, l'application fonctionne en mode démo et stocke tout sur le téléphone.

## Structure

```
src/
  app/            écrans (expo-router)
    index.tsx     accueil
    triage.tsx    questionnaire
    resultat.tsx  orientation
    medecins.tsx  annuaire
    consultation/[id].tsx
    historique.tsx
    profil.tsx
    auth.tsx
    espace-medecin.tsx
  components/ui.tsx
  lib/
    triage.ts     questions + moteur de score
    doctors.ts    annuaire de démonstration
    api.ts        accès données (Supabase ou local)
    supabase.ts
    storage.ts
  store.tsx       état global persistant
  theme.ts        palette naturelle
supabase/schema.sql
```

## Prochaines étapes

1. Authentification téléphone + OTP (Supabase Auth) et rôles patient / médecin vérifiés.
2. Messagerie temps réel patient ↔ médecin.
3. Visio (Daily ou Jitsi) avec salle d'attente.
4. Ordonnance PDF et partage.
5. Paiement Mobile Money (Orange Money / MTN MoMo) via agrégateur.

## Avertissement

L'application ne pose pas de diagnostic. Les règles de triage sont un outil d'orientation et
doivent être validées par un médecin avant toute mise en production.
