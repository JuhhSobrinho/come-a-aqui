// Painel do Supabase > seu projeto > Project Settings > API
// Cole aqui os dois valores. O "anon public" é seguro de expor no front-end
// (a segurança de verdade vem das políticas de RLS criadas em supabase-schema.sql).
const SUPABASE_URL = "https://kedwwailzdceamtyccpj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LnmyI_Fk5wPytnXHJpodwQ_8pLJwsHM";

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
