// Connexion Supabase. Pour brancher un vrai backend :
// créer un projet sur supabase.com, copier Project URL et la clé anon depuis Project Settings > API,
// activer le fournisseur Phone (Twilio) dans Authentication > Providers,
// puis exécuter supabase/schema.sql dans le SQL Editor.
// Tant que les deux champs sont vides, l'application reste en mode démo.
window.YC_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: ""
};
