-- Execute este script inteiro no Supabase: Painel do projeto > SQL Editor > New query > Run

-- Tabela de empresas (contratantes), uma linha por usuário autenticado
create table if not exists public.empresas (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  tipo_documento text not null check (tipo_documento in ('cnpj', 'cpf')),
  documento text not null,
  criado_em timestamptz not null default now()
);

-- Tabela de vagas publicadas pelas empresas
create table if not exists public.vagas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  cargo text not null,
  cidade text not null,
  modalidade text not null check (modalidade in ('Presencial', 'Híbrido', 'Remoto')),
  nivel text not null check (nivel in ('Estágio', 'Júnior', 'Pleno', 'Sênior')),
  contratacao text not null check (contratacao in ('CLT', 'PJ', 'Estágio')),
  salario numeric not null,
  descricao text not null,
  beneficios text,
  habilidades text[] not null default '{}',
  telefone text,
  email text not null,
  link_externo text,
  status text not null default 'Ativa' check (status in ('Ativa', 'Pausada', 'Encerrada')),
  data_publicacao date not null default current_date,
  criado_em timestamptz not null default now()
);

-- Cria automaticamente a linha em "empresas" assim que alguém se cadastra
-- (os dados vêm do options.data passado no supabase.auth.signUp do front-end)
create or replace function public.lidar_novo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.empresas (id, nome, tipo_documento, documento)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome',
    new.raw_user_meta_data ->> 'tipo_documento',
    new.raw_user_meta_data ->> 'documento'
  );
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.lidar_novo_usuario();

-- Row Level Security: cada empresa só mexe nos próprios dados;
-- candidatos (sem login) só enxergam vagas com status "Ativa"
alter table public.empresas enable row level security;
alter table public.vagas enable row level security;

create policy "Empresa vê e edita seus próprios dados"
  on public.empresas for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Qualquer pessoa vê vagas ativas, empresa vê todas as suas"
  on public.vagas for select
  using (status = 'Ativa' or auth.uid() = empresa_id);

create policy "Empresa cria vaga para si mesma"
  on public.vagas for insert
  with check (auth.uid() = empresa_id);

create policy "Empresa atualiza suas próprias vagas"
  on public.vagas for update
  using (auth.uid() = empresa_id);

create policy "Empresa exclui suas próprias vagas"
  on public.vagas for delete
  using (auth.uid() = empresa_id);
