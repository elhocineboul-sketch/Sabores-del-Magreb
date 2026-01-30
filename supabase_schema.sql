-- 1. Profiles Table (Extends Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  phone text,
  image text
);

-- 2. Menu Items Table
create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  description text,
  price numeric not null,
  category text not null,
  image text,
  rating numeric default 5,
  calories numeric default 0,
  spiciness numeric default 0,
  sweetness numeric default 0,
  protein numeric default 0,
  carbs numeric default 0
);

-- 3. Orders Table
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users,
  customer text,
  items jsonb, -- Stores the array of CartItems
  total numeric,
  status text default 'pending',
  date text,
  payment text,
  type text,
  confirmation_code text,
  delivery_info jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;

-- 5. Create Policies (Permissive policies for this hybrid app)

-- Profiles: Public read, User update own
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Menu Items: Public read, All insert/update/delete (Protected by App Admin Login logic)
create policy "Menu items are viewable by everyone." on public.menu_items for select using (true);
create policy "Enable insert for authenticated users and anon (Hybrid)." on public.menu_items for insert with check (true);
create policy "Enable update for authenticated users and anon." on public.menu_items for update using (true);
create policy "Enable delete for authenticated users and anon." on public.menu_items for delete using (true);

-- Orders: Public read (for tracking), All insert/update
create policy "Orders are viewable by everyone." on public.orders for select using (true);
create policy "Enable insert for everyone." on public.orders for insert with check (true);
create policy "Enable update for everyone." on public.orders for update using (true);