import { query } from './postgres';

let bootstrapPromise: Promise<void> | null = null;

export function ensureDbBootstrap() {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        phone VARCHAR(10) UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, role_id)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        access_token_hash TEXT UNIQUE NOT NULL,
        refresh_token_hash TEXT UNIQUE NOT NULL,
        role_code TEXT NOT NULL,
        user_agent TEXT,
        ip_address TEXT,
        expires_at TIMESTAMPTZ NOT NULL,
        refresh_expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS otp_challenges (
        id UUID PRIMARY KEY,
        phone VARCHAR(10) NOT NULL,
        purpose TEXT NOT NULL,
        role_code TEXT,
        full_name TEXT,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        consumed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS sms_events (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        phone VARCHAR(10) NOT NULL,
        event_type TEXT NOT NULL,
        status TEXT NOT NULL,
        meta JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS runtime_app_config (
        key TEXT PRIMARY KEY,
        value_json JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS runtime_ui_content (
        content_key TEXT NOT NULL,
        locale TEXT NOT NULL DEFAULT 'en-US',
        value_text TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (content_key, locale)
      );
    `);

    await seedDefaults();
  })();

  return bootstrapPromise;
}

async function seedDefaults() {
  await query(
    `
      INSERT INTO roles (id, code, name)
      VALUES
        ('11111111-1111-1111-1111-111111111111', 'user', 'User'),
        ('22222222-2222-2222-2222-222222222222', 'garage', 'Garage'),
        ('33333333-3333-3333-3333-333333333333', 'vendor', 'Vendor'),
        ('44444444-4444-4444-4444-444444444444', 'admin', 'Admin')
      ON CONFLICT (code) DO NOTHING;
    `
  );

  await query(
    `
      INSERT INTO runtime_app_config (key, value_json)
      VALUES
      ('app_identity', '{"name":"WrectifAI","tagline":"Service. Quotes. Simplified."}'::jsonb)
      ON CONFLICT (key) DO NOTHING;
    `
  );

  await query(
    `
      INSERT INTO runtime_ui_content (content_key, locale, value_text)
      VALUES
      ('auth.register.title', 'en-US', 'Create Account'),
      ('auth.register.subtitle', 'en-US', 'Start your journey with WrectifAI precision today.'),
      ('auth.login.title', 'en-US', 'Welcome Back'),
      ('auth.login.subtitle', 'en-US', 'Login with your 10-digit phone number.'),
      ('auth.hero.kicker', 'en-US', 'AUTOMOTIVE INTELLIGENCE'),
      ('auth.hero.title', 'en-US', 'Experience Surgical Precision in Car Care.'),
      ('auth.hero.body', 'en-US', 'Join the elite ecosystem of automotive specialists and car enthusiasts driving the future of service management.'),
      ('auth.role.user.description', 'en-US', 'I need service'),
      ('auth.role.garage.description', 'en-US', 'I provide service'),
      ('auth.role.vendor.description', 'en-US', 'I sell parts')
      ON CONFLICT (content_key, locale) DO NOTHING;
    `
  );
}
