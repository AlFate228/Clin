import { neon } from '@neondatabase/serverless';
export const sql = neon(process.env.DATABASE_URL!);
export async function ensureDb(){
  await sql`CREATE TABLE IF NOT EXISTS blocked_dates (date date PRIMARY KEY, created_at timestamptz DEFAULT now());`;
  await sql`CREATE TABLE IF NOT EXISTS bookings (id bigserial PRIMARY KEY, name text NOT NULL, phone text NOT NULL, car_make text NOT NULL, plate text NOT NULL, visit_date date NOT NULL, visit_time text NOT NULL, services jsonb NOT NULL, extra text DEFAULT '', created_at timestamptz DEFAULT now());`;
}
