// Configuración del control remoto cuando la presentación está publicada (Vercel).
// Mismo proyecto de Supabase que las presentaciones de Migue y de EstudIA: sólo
// se usan canales en tiempo real (broadcast), no se toca ninguna tabla. La clave
// anon es pública por diseño; lo que protege la botonera es el código de sala,
// que va SOLO en el link (?sala=…), nunca acá.
window.UBA_CONFIG = {
  supabaseUrl: 'https://sdnbrlobzqfzurfpoxam.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbmJybG9ienFmenVyZnBveGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MTMzNzAsImV4cCI6MjEwNjE4OTM3MH0.oin_JWb1_obOMFtXl-ToZRJN449fVVN3BgaFiebCfAk',
};
