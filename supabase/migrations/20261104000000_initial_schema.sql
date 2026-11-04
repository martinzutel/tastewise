-- Tastewise initial schema
-- Catalogue tables (recipes, ingredients, categories) are public-read.
-- User tables are protected by row level security: auth.uid() = user_id.


-- ---------------------------------------------------------------- enums
create type public.difficulty as enum ('easy', 'medium', 'advanced');
create type public.diet as enum ('vegetarian', 'vegan', 'gluten-free', 'dairy-free');
create type public.ingredient_category as enum (
  'vegetables', 'fruits', 'dairy', 'meat-fish', 'grains-flour', 'spices', 'pantry-staples', 'other'
);
create type public.shopping_category as enum ('produce', 'dairy', 'meat', 'dry-goods', 'other');
create type public.ingredient_sentiment as enum ('favorite', 'disliked');

-- ---------------------------------------------------------------- catalogue
create table public.ingredients (
  id              text primary key check (id ~ '^[a-z0-9-]+$'),   -- stable slug
  name            text not null,
  plural          text,
  category        public.ingredient_category not null,
  is_staple       boolean not null default false,                  -- salt, water: ignored by pantry matching
  contains_meat   boolean not null default false,
  contains_fish   boolean not null default false,
  contains_dairy  boolean not null default false,
  contains_egg    boolean not null default false,
  contains_honey  boolean not null default false,
  contains_gluten boolean not null default false
);

create table public.categories (
  id   smallint generated always as identity primary key,
  slug text not null unique,
  name text not null
);

create table public.recipes (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title              text not null,
  description        text not null,
  image_url          text not null,
  image_alt          text not null,
  prep_time          integer not null check (prep_time >= 0),
  cook_time          integer not null default 0 check (cook_time >= 0),
  rest_time          integer not null default 0 check (rest_time >= 0),
  total_time         integer generated always as (prep_time + cook_time + rest_time) stored,
  difficulty         public.difficulty not null,
  cuisine            text not null,
  cuisine_group      text generated always as (
                       case lower(cuisine)
                         when 'italian' then 'italian'
                         when 'mexican' then 'mexican'
                         when 'japanese' then 'japanese'
                         when 'american' then 'american'
                         when 'mediterranean' then 'mediterranean'
                         when 'greek' then 'mediterranean'
                         when 'middle eastern' then 'mediterranean'
                         else 'other'
                       end) stored,
  servings           integer not null check (servings > 0),
  -- Demo ratings are sample content, not real user reviews.
  rating             numeric(2, 1) not null default 0 check (rating between 0 and 5),
  review_count       integer not null default 0 check (review_count >= 0),
  popularity         integer not null default 0,
  is_featured        boolean not null default false,
  is_vegetarian      boolean not null default false,
  is_vegan           boolean not null default false,
  is_gluten_free     boolean not null default false,
  is_dairy_free      boolean not null default false,
  calories           integer not null check (calories >= 0),
  protein            numeric(6, 1) not null,
  carbohydrates      numeric(6, 1) not null,
  fat                numeric(6, 1) not null,
  nutrition_verified boolean not null default false,
  notes              text,
  tags               text[] not null default '{}',
  search_vector      tsvector,
  created_at         timestamptz not null default now()
);

create table public.recipe_categories (
  recipe_id   uuid not null references public.recipes (id) on delete cascade,
  category_id smallint not null references public.categories (id) on delete cascade,
  primary key (recipe_id, category_id)
);

create table public.recipe_ingredients (
  id            bigint generated always as identity primary key,
  recipe_id     uuid not null references public.recipes (id) on delete cascade,
  ingredient_id text not null references public.ingredients (id),
  position      smallint not null,
  quantity      numeric(10, 3) check (quantity is null or quantity > 0),
  unit          text,
  note          text,
  is_optional   boolean not null default false,
  unique (recipe_id, position)
);

create table public.recipe_steps (
  recipe_id   uuid not null references public.recipes (id) on delete cascade,
  step_number smallint not null check (step_number > 0),
  instruction text not null,
  primary key (recipe_id, step_number)
);

create table public.recipe_tips (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  position  smallint not null,
  tip       text not null,
  primary key (recipe_id, position)
);

create table public.recipe_substitutions (
  recipe_id  uuid not null references public.recipes (id) on delete cascade,
  position   smallint not null,
  ingredient text not null,
  substitute text not null,
  primary key (recipe_id, position)
);

create index recipes_search_idx on public.recipes using gin (search_vector);
create index recipes_total_time_idx on public.recipes (total_time);
create index recipes_popularity_idx on public.recipes (popularity desc);
create index recipes_created_at_idx on public.recipes (created_at desc);
create index recipe_ingredients_recipe_idx on public.recipe_ingredients (recipe_id);
create index recipe_ingredients_ingredient_idx on public.recipe_ingredients (ingredient_id);
create index recipe_categories_category_idx on public.recipe_categories (category_id);

-- ---------------------------------------------------------------- full-text search
-- Weighted document: title (A), cuisine + categories + ingredient names (B),
-- description + tags (C). Kept in sync by triggers below.
create or replace function public.refresh_recipe_search(p_recipe_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.recipes r set search_vector =
      setweight(to_tsvector('english', coalesce(r.title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(r.cuisine, '')), 'B')
    || setweight(to_tsvector('english', coalesce((
         select string_agg(c.name, ' ') from public.recipe_categories rc
         join public.categories c on c.id = rc.category_id where rc.recipe_id = r.id), '')), 'B')
    || setweight(to_tsvector('english', coalesce((
         select string_agg(i.name || ' ' || coalesce(i.plural, ''), ' ') from public.recipe_ingredients ri
         join public.ingredients i on i.id = ri.ingredient_id where ri.recipe_id = r.id), '')), 'B')
    || setweight(to_tsvector('english', coalesce(r.description, '') || ' ' || array_to_string(r.tags, ' ')), 'C')
  where r.id = p_recipe_id;
$$;

create or replace function public.recipes_search_trigger()
returns trigger language plpgsql as $$
begin
  perform public.refresh_recipe_search(coalesce(new.id, old.id));
  return null;
end $$;

create or replace function public.recipe_children_search_trigger()
returns trigger language plpgsql as $$
begin
  perform public.refresh_recipe_search(coalesce(new.recipe_id, old.recipe_id));
  return null;
end $$;

create trigger recipes_search_refresh
  after insert or update of title, description, cuisine, tags on public.recipes
  for each row execute function public.recipes_search_trigger();
create trigger recipe_ingredients_search_refresh
  after insert or update or delete on public.recipe_ingredients
  for each row execute function public.recipe_children_search_trigger();
create trigger recipe_categories_search_refresh
  after insert or update or delete on public.recipe_categories
  for each row execute function public.recipe_children_search_trigger();

-- Single entry point for the Explore page. Returns recipe rows so the client
-- can embed related tables (PostgREST resource embedding on RPC results).
create or replace function public.search_recipes(
  p_query      text default null,
  p_time       text[] default null,
  p_difficulty text[] default null,
  p_diets      text[] default null,
  p_categories text[] default null,
  p_cuisines   text[] default null,
  p_exclude    text[] default null
) returns setof public.recipes
language sql stable set search_path = public as $$
  with q as (
    select case when nullif(trim(p_query), '') is null then null
                else websearch_to_tsquery('english', p_query) end as tsq
  )
  select r.* from public.recipes r, q
  where (q.tsq is null or r.search_vector @@ q.tsq)
    and (p_time is null or
         ('under-15' = any(p_time) and r.total_time < 15) or
         ('15-30'    = any(p_time) and r.total_time between 15 and 30) or
         ('30-60'    = any(p_time) and r.total_time between 31 and 60) or
         ('over-60'  = any(p_time) and r.total_time > 60))
    and (p_difficulty is null or r.difficulty::text = any(p_difficulty))
    and (p_diets is null or (
         (not 'vegetarian'  = any(p_diets) or r.is_vegetarian) and
         (not 'vegan'       = any(p_diets) or r.is_vegan) and
         (not 'gluten-free' = any(p_diets) or r.is_gluten_free) and
         (not 'dairy-free'  = any(p_diets) or r.is_dairy_free)))
    and (p_categories is null or exists (
         select 1 from public.recipe_categories rc join public.categories c on c.id = rc.category_id
         where rc.recipe_id = r.id and c.slug = any(p_categories)))
    and (p_cuisines is null or r.cuisine_group = any(p_cuisines))
    and (p_exclude is null or not exists (
         select 1 from public.recipe_ingredients ri
         where ri.recipe_id = r.id and not ri.is_optional and ri.ingredient_id = any(p_exclude)))
  order by
    case when q.tsq is null then 0 else ts_rank(r.search_vector, q.tsq) end desc,
    r.popularity desc;
$$;

-- ---------------------------------------------------------------- user data
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text check (char_length(name) <= 60),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.user_favorites (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id  uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table public.pantry_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ingredient_id text not null references public.ingredients (id),
  quantity      numeric(10, 3) check (quantity is null or quantity > 0),
  unit          text check (char_length(unit) <= 16),
  created_at    timestamptz not null default now(),
  unique (user_id, ingredient_id)
);

create table public.shopping_list_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ingredient_id text references public.ingredients (id),          -- null for custom items
  name          text not null check (char_length(name) between 1 and 80),
  quantity      numeric(10, 3) check (quantity is null or quantity > 0),
  unit          text check (char_length(unit) <= 16),
  category      public.shopping_category not null default 'other',
  is_completed  boolean not null default false,
  sources       text[] not null default '{}',                     -- recipe titles, for context
  created_at    timestamptz not null default now()
);

create table public.user_preferences (
  user_id              uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  diets                public.diet[] not null default '{}',
  preferred_cuisines   text[] not null default '{}',
  preferred_max_time   integer check (preferred_max_time is null or preferred_max_time > 0),
  preferred_difficulty public.difficulty,
  updated_at           timestamptz not null default now()
);

create table public.user_ingredient_preferences (
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ingredient_id text not null references public.ingredients (id) on delete cascade,
  preference    public.ingredient_sentiment not null,
  primary key (user_id, ingredient_id)
);

create index pantry_items_user_idx on public.pantry_items (user_id);
create index shopping_list_items_user_idx on public.shopping_list_items (user_id, created_at);
create index user_favorites_user_idx on public.user_favorites (user_id, created_at desc);

-- Create a profile row for every new auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- row level security
alter table public.ingredients enable row level security;
alter table public.categories enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_categories enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.recipe_tips enable row level security;
alter table public.recipe_substitutions enable row level security;

create policy "Catalogue is public" on public.ingredients for select using (true);
create policy "Catalogue is public" on public.categories for select using (true);
create policy "Catalogue is public" on public.recipes for select using (true);
create policy "Catalogue is public" on public.recipe_categories for select using (true);
create policy "Catalogue is public" on public.recipe_ingredients for select using (true);
create policy "Catalogue is public" on public.recipe_steps for select using (true);
create policy "Catalogue is public" on public.recipe_tips for select using (true);
create policy "Catalogue is public" on public.recipe_substitutions for select using (true);

alter table public.profiles enable row level security;
alter table public.user_favorites enable row level security;
alter table public.pantry_items enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_ingredient_preferences enable row level security;

create policy "Own profile" on public.profiles
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Own favorites" on public.user_favorites
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Own pantry" on public.pantry_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Own shopping list" on public.shopping_list_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Own preferences" on public.user_preferences
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Own ingredient preferences" on public.user_ingredient_preferences
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------- avatar storage
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly readable" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "Users upload their own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users replace their own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete their own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
