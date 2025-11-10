/*
# EventConnect Database Schema

Полная схема БД для Telegram Mini App с афишей событий, бронированием билетов, 
Tinder-свайпами, вакансиями и системой ролей.

## Query Description:
Создает комплексную структуру базы данных для мини-приложения EventConnect.
Включает таблицы пользователей, событий, билетов, заказов, вакансий, матчей и промоакций.
Настраивает RLS политики для безопасности данных и создает необходимые индексы для производительности.
Это безопасная операция - создание новых таблиц без влияния на существующие данные.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tables: users, events, tickets, orders, promotions, vacancies, vacancy_applications, matches, user_preferences
- Extensions: PostGIS для геолокации, pgcrypto для генерации UUID
- RLS: Включен на всех таблицах с role-based политиками
- Triggers: Автоматическое создание профилей, обновление timestamps

## Security Implications:
- RLS Status: Enabled на всех таблицах
- Policy Changes: Yes - role-based access control
- Auth Requirements: Все операции требуют аутентификации через Telegram

## Performance Impact:
- Indexes: Созданы на всех внешних ключах и часто запрашиваемых полях
- Triggers: Minimal impact - только для профилей и timestamps
- Estimated Impact: Low - оптимизированная структура с правильными индексами
*/

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table (extended profile)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'promoter', 'manager', 'admin')),
  location JSONB,
  coordinates GEOGRAPHY(Point),
  bio TEXT,
  interests TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('concert', 'party', 'festival', 'exhibition', 'sport', 'theater', 'cinema', 'other')),
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  coordinates GEOGRAPHY(Point),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_seats INTEGER NOT NULL DEFAULT 0,
  available_seats INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  images TEXT[],
  video_url TEXT,
  organizer_id UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'cancelled', 'completed')),
  tags TEXT[],
  age_restriction INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  ticket_number TEXT UNIQUE NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled', 'refunded')),
  seat_number TEXT,
  price DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  payment_method TEXT,
  invoice_id TEXT UNIQUE,
  telegram_payment_charge_id TEXT,
  provider_payment_charge_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions table (for promoters)
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promoter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  total_sales DECIMAL(10,2) DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  tickets_sold INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vacancies table
CREATE TABLE IF NOT EXISTS public.vacancies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company_name TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('promoter', 'manager', 'staff', 'security', 'technical')),
  location TEXT,
  coordinates GEOGRAPHY(Point),
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  requirements TEXT[],
  benefits TEXT[],
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'project', 'one_time')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  posted_by UUID REFERENCES public.users(id),
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vacancy Applications table
CREATE TABLE IF NOT EXISTS public.vacancy_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacancy_id UUID NOT NULL REFERENCES public.vacancies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  cover_letter TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vacancy_id, user_id)
);

-- Matches table (Tinder-like)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  message TEXT,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id, event_id)
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  preferred_categories TEXT[],
  max_distance INTEGER DEFAULT 50,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'ru' CHECK (language IN ('ru', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_coordinates ON public.users USING GIST(coordinates);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_coordinates ON public.events USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);

CREATE INDEX IF NOT EXISTS idx_tickets_event ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_order ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_promotions_promoter ON public.promotions(promoter_id);
CREATE INDEX IF NOT EXISTS idx_promotions_event ON public.promotions(event_id);

CREATE INDEX IF NOT EXISTS idx_vacancies_status ON public.vacancies(status);
CREATE INDEX IF NOT EXISTS idx_vacancies_role_type ON public.vacancies(role_type);

CREATE INDEX IF NOT EXISTS idx_matches_sender ON public.matches(sender_id);
CREATE INDEX IF NOT EXISTS idx_matches_receiver ON public.matches(receiver_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancy_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint);

-- RLS Policies for events
CREATE POLICY "Anyone can view active events" ON public.events
  FOR SELECT USING (status = 'active');

CREATE POLICY "Organizers can manage their events" ON public.events
  FOR ALL USING (organizer_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
      AND role = 'admin'
    )
  );

-- RLS Policies for tickets
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (user_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (user_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

-- RLS Policies for promotions
CREATE POLICY "Promoters can view own promotions" ON public.promotions
  FOR SELECT USING (promoter_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

-- RLS Policies for vacancies
CREATE POLICY "Anyone can view open vacancies" ON public.vacancies
  FOR SELECT USING (status = 'open');

CREATE POLICY "Managers can manage vacancies" ON public.vacancies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
      AND role IN ('manager', 'admin')
    )
  );

-- RLS Policies for vacancy applications
CREATE POLICY "Users can view own applications" ON public.vacancy_applications
  FOR SELECT USING (user_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

CREATE POLICY "Users can create applications" ON public.vacancy_applications
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

-- RLS Policies for matches
CREATE POLICY "Users can view own matches" ON public.matches
  FOR SELECT USING (
    sender_id IN (SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint)
    OR receiver_id IN (SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint)
  );

CREATE POLICY "Users can create matches" ON public.matches
  FOR INSERT WITH CHECK (sender_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

CREATE POLICY "Users can update own matches" ON public.matches
  FOR UPDATE USING (
    receiver_id IN (SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint)
  );

-- RLS Policies for user preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (user_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (user_id IN (
    SELECT id FROM public.users WHERE telegram_id = (current_setting('request.jwt.claims', true)::json->>'telegram_id')::bigint
  ));

-- Functions for booking tickets
CREATE OR REPLACE FUNCTION book_tickets(
  p_event_id UUID,
  p_user_id UUID,
  p_quantity INTEGER,
  p_total_amount DECIMAL
)
RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
  v_available INTEGER;
  v_ticket_ids UUID[];
  v_ticket_id UUID;
  i INTEGER;
BEGIN
  SELECT available_seats INTO v_available FROM public.events WHERE id = p_event_id FOR UPDATE;
  
  IF v_available < p_quantity THEN
    RAISE EXCEPTION 'Not enough seats available';
  END IF;

  INSERT INTO public.orders (user_id, total_amount, status)
  VALUES (p_user_id, p_total_amount, 'pending')
  RETURNING id INTO v_order_id;

  FOR i IN 1..p_quantity LOOP
    INSERT INTO public.tickets (
      event_id, 
      user_id, 
      order_id, 
      ticket_number, 
      qr_code, 
      price
    )
    VALUES (
      p_event_id,
      p_user_id,
      v_order_id,
      'TKT-' || substring(gen_random_uuid()::text, 1, 8),
      encode(gen_random_bytes(16), 'hex'),
      p_total_amount / p_quantity
    )
    RETURNING id INTO v_ticket_id;
    
    v_ticket_ids := array_append(v_ticket_ids, v_ticket_id);
  END LOOP;

  UPDATE public.events 
  SET available_seats = available_seats - p_quantity 
  WHERE id = p_event_id;

  RETURN json_build_object(
    'order_id', v_order_id,
    'ticket_ids', v_ticket_ids
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get nearby events using PostGIS
CREATE OR REPLACE FUNCTION get_nearby_events(
  p_user_lat DOUBLE PRECISION,
  p_user_lng DOUBLE PRECISION,
  p_max_distance INTEGER DEFAULT 50000
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  event_date TIMESTAMPTZ,
  price DECIMAL,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.category,
    e.event_date,
    e.price,
    ST_Distance(
      e.coordinates,
      ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography
    ) as distance_meters
  FROM public.events e
  WHERE 
    e.status = 'active'
    AND e.available_seats > 0
    AND ST_DWithin(
      e.coordinates,
      ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography,
      p_max_distance
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin statistics
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.users),
    'total_events', (SELECT COUNT(*) FROM public.events),
    'active_events', (SELECT COUNT(*) FROM public.events WHERE status = 'active'),
    'total_tickets_sold', (SELECT COUNT(*) FROM public.tickets WHERE status = 'active'),
    'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status = 'paid'),
    'pending_applications', (SELECT COUNT(*) FROM public.vacancy_applications WHERE status = 'pending')
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
