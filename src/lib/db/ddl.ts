// Table definitions matching schema.ts. Run once per database (idempotent), then seed.ts fills it.
export const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  role text NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  phone text,
  school text,
  grade integer,
  jenjang text,
  target text,
  branch text,
  avatar integer NOT NULL DEFAULT 0,
  coin integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  rank_delta integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  parent jsonb,
  package_id integer,
  package_until timestamp,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS master_data (
  id serial PRIMARY KEY,
  kind text NOT NULL,
  name text NOT NULL,
  parent text,
  jenjang text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS materials (
  id serial PRIMARY KEY,
  title text NOT NULL,
  subject text NOT NULL,
  bidang text NOT NULL,
  bab text NOT NULL,
  jenjang text NOT NULL,
  grade integer NOT NULL,
  pages integer NOT NULL DEFAULT 12,
  summary text,
  status text NOT NULL DEFAULT 'publish',
  author text,
  video_count integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS progress (
  user_id integer NOT NULL,
  material_id integer NOT NULL,
  page integer NOT NULL DEFAULT 1,
  updated_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, material_id)
);
CREATE TABLE IF NOT EXISTS questions (
  id serial PRIMARY KEY,
  subject text NOT NULL,
  bidang text NOT NULL,
  bab text NOT NULL,
  jenjang text NOT NULL,
  grade integer NOT NULL,
  level text NOT NULL,
  type text NOT NULL DEFAULT 'pg',
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  answer text NOT NULL,
  explanation text,
  tag text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS quizzes (
  id serial PRIMARY KEY,
  title text NOT NULL,
  kind text NOT NULL,
  subject text NOT NULL,
  bidang text,
  bab text,
  level text,
  jenjang text NOT NULL,
  grade integer,
  duration_min integer NOT NULL DEFAULT 10,
  question_ids jsonb NOT NULL DEFAULT '[]',
  access_code text,
  starts_at timestamp,
  ends_at timestamp,
  status text NOT NULL DEFAULT 'aktif',
  coin_cost integer NOT NULL DEFAULT 0,
  free_attempts integer NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS attempts (
  id serial PRIMARY KEY,
  user_id integer,
  quiz_id integer NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  flagged jsonb NOT NULL DEFAULT '[]',
  score integer,
  correct integer,
  total integer NOT NULL,
  started_at timestamp NOT NULL DEFAULT now(),
  submitted_at timestamp
);
CREATE TABLE IF NOT EXISTS videos (
  id serial PRIMARY KEY,
  title text NOT NULL,
  subject text NOT NULL DEFAULT 'Matematika',
  bidang text NOT NULL,
  jenjang text NOT NULL,
  duration_sec integer NOT NULL,
  url text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 1,
  quiz_id integer,
  views integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'publish',
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS video_progress (
  user_id integer NOT NULL,
  video_id integer NOT NULL,
  seconds integer NOT NULL DEFAULT 0,
  done boolean NOT NULL DEFAULT false,
  saved boolean NOT NULL DEFAULT false,
  updated_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, video_id)
);
CREATE TABLE IF NOT EXISTS notifications (
  id serial PRIMARY KEY,
  user_id integer,
  kind text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  href text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS notification_reads (
  user_id integer NOT NULL,
  notification_id integer NOT NULL,
  PRIMARY KEY (user_id, notification_id)
);
CREATE TABLE IF NOT EXISTS images (
  id serial PRIMARY KEY,
  name text NOT NULL,
  mime text NOT NULL,
  size integer NOT NULL,
  width integer,
  height integer,
  data text NOT NULL,
  folder text NOT NULL DEFAULT 'Soal',
  uploaded_by text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS packages (
  id serial PRIMARY KEY,
  kind text NOT NULL DEFAULT 'langganan',
  name text NOT NULL,
  jenjang text NOT NULL,
  price integer NOT NULL,
  price_original integer,
  tagline text,
  duration_days integer NOT NULL,
  coin integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]',
  highlight boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS coin_tx (
  id serial PRIMARY KEY,
  user_id integer NOT NULL,
  amount integer NOT NULL,
  note text NOT NULL,
  by text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payments (
  id serial PRIMARY KEY,
  user_id integer NOT NULL,
  item text NOT NULL,
  amount integer NOT NULL,
  method text NOT NULL,
  status text NOT NULL DEFAULT 'lunas',
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS tasks (
  id serial PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  assignee_id integer,
  priority text NOT NULL,
  due_at timestamp,
  done boolean NOT NULL DEFAULT false,
  note text,
  created_by text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS activity (
  id serial PRIMARY KEY,
  actor text NOT NULL,
  avatar integer NOT NULL DEFAULT 0,
  text text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp NOT NULL DEFAULT now()
);
`;
