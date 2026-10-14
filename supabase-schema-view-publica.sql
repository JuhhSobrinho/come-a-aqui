-- Rode este script também no SQL Editor (adicional ao supabase-schema.sql).
-- Cria uma visão pública com só o nome da empresa, sem expor CNPJ/CPF,
-- já que a tabela "empresas" só permite SELECT da própria empresa (RLS).
create or replace view public.empresas_publicas as
select id, nome from public.empresas;

grant select on public.empresas_publicas to anon, authenticated;
