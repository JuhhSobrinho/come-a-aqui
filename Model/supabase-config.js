// Painel do Supabase > seu projeto > Project Settings > API
// Cole aqui os dois valores. O "anon public" é seguro de expor no front-end
// (a segurança de verdade vem das políticas de RLS criadas em supabase-schema.sql).
const SUPABASE_URL = "https://kedwwailzdceamtyccpj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZHd3YWlsemRjZWFtdHljY3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MzExODAsImV4cCI6MjEwODEwNzE4MH0.NzSdwVkxLjBW-QGQfWrZCuCgY_uR3wadBnh8tLuKcWM";

window.supabaseClient = null;

try {
  if (SUPABASE_URL.includes("SEU-PROJETO") || SUPABASE_ANON_KEY.includes("SUA-CHAVE")) {
    console.warn(
      "Supabase ainda não configurado: edite Model/supabase-config.js com a URL e a chave do seu projeto."
    );
  } else {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (erro) {
  console.error("Erro ao iniciar o Supabase:", erro);
}
