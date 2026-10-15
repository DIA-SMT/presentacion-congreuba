// Configuración del control remoto cuando la presentación está publicada (Vercel).
// Mismo proyecto de Supabase que las presentaciones de Migue y de EstudIA: sólo
// se usan canales en tiempo real (broadcast), no se toca ninguna tabla. La clave
// anon es pública por diseño.
//
// `sala` es el canal fijo donde se encuentran la pantalla y la botonera: basta con
// abrir la dirección, sin código. Quien abra /control maneja la presentación, así
// que esa dirección no se comparte. Sin `sala`, vuelve el código en el link (?sala=…).
window.UBA_CONFIG = {
  supabaseUrl: 'https://sdnbrlobzqfzurfpoxam.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbmJybG9ienFmenVyZnBveGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MTMzNzAsImV4cCI6MjEwNjE4OTM3MH0.oin_JWb1_obOMFtXl-ToZRJN449fVVN3BgaFiebCfAk',
  sala: 'panel-uba-16-10',
};
