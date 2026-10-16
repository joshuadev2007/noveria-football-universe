-- NOVERIA Football Universe · Guardado global privado
-- Ejecutar una sola vez en Supabase > SQL Editor > New query > Run.
-- Cada usuario solo puede leer / modificar SU partida gracias a Row Level Security.
create table if not exists public.noveria_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  game_state jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

alter table public.noveria_saves enable row level security;

-- Repetible en caso de volver a ejecutar el script.
drop policy if exists noveria_select_own on public.noveria_saves;
create policy noveria_select_own on public.noveria_saves for select to authenticated
  using (auth.uid() = user_id);
drop policy if exists noveria_insert_own on public.noveria_saves;
create policy noveria_insert_own on public.noveria_saves for insert to authenticated
  with check (auth.uid() = user_id);
drop policy if exists noveria_update_own on public.noveria_saves;
create policy noveria_update_own on public.noveria_saves for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select,insert,update on public.noveria_saves to authenticated;
revoke all on public.noveria_saves from anon;

-- Escritura transaccional con control de revisión para evitar que un móvil
-- desactualizado sobreescriba sin avisar la partida más reciente de PC.
create or replace function public.save_noveria_game(
  p_expected_revision bigint,
  p_state jsonb
) returns table(revision bigint, updated_at timestamptz)
language plpgsql security invoker set search_path = public
as $$
declare saved public.noveria_saves%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Iniciá sesión' using errcode='28000';
  end if;
  if p_state is null or jsonb_typeof(p_state) <> 'object' or pg_column_size(p_state) > 16000000 then
    raise exception 'La partida debe ser un JSON válido y menor a 16 MB' using errcode='22023';
  end if;
  if p_expected_revision = 0 then
    insert into public.noveria_saves(user_id,game_state,revision,updated_at)
      values(auth.uid(),p_state,1,now())
      on conflict (user_id) do nothing
      returning * into saved;
  else
    update public.noveria_saves
      set game_state=p_state,revision=public.noveria_saves.revision+1,updated_at=now()
      where user_id=auth.uid() and public.noveria_saves.revision=p_expected_revision
      returning * into saved;
  end if;
  if not found then
    raise exception 'Conflicto de versión: otro dispositivo guardó antes. No se reemplazó la partida.'
      using errcode='40001';
  end if;
  return query select saved.revision,saved.updated_at;
end;
$$;
revoke all on function public.save_noveria_game(bigint,jsonb) from PUBLIC;
revoke all on function public.save_noveria_game(bigint,jsonb) from anon;
grant execute on function public.save_noveria_game(bigint,jsonb) to authenticated;

-- Nota: el backend debe usar la SUPABASE_ANON_KEY pública;
-- NUNCA copiar la service_role / sb_secret a archivos de GitHub.
