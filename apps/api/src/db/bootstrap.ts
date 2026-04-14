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
      CREATE TABLE IF NOT EXISTS ui_content (
        id SERIAL PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'default',
        module TEXT NOT NULL,
        page TEXT NOT NULL,
        locale TEXT NOT NULL,
        version INT NOT NULL DEFAULT 1,
        content JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, module, page, locale)
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_ui_content_lookup
      ON ui_content (tenant_id, module, page, locale);
    `);

    await query(`
      DROP TABLE IF EXISTS runtime_ui_content;
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
      INSERT INTO ui_content (tenant_id, module, page, locale, version, content)
      VALUES
      (
        'default',
        'auth',
        'login',
        'en-US',
        1,
        '{
          "appName": "WrectifAI",
          "authModeLabel": "Phone + OTP authentication",
          "hero": {
            "kicker": "AUTOMOTIVE INTELLIGENCE",
            "title": "Experience Surgical Precision in Car Care.",
            "body": "Join the elite ecosystem of automotive specialists and car enthusiasts driving the future of service management."
          },
          "links": {
            "needAccountPrefix": "Need an account?",
            "needAccountCta": "Register"
          },
          "form": {
            "title": "Welcome Back",
            "subtitle": "Login with your 10-digit phone number.",
            "phoneLabel": "Phone Number *",
            "phonePlaceholder": "9876543210",
            "sendOtpLabel": "Send OTP",
            "sendingOtpLabel": "Sending OTP..."
          },
          "errors": {
            "phoneInvalid": "Phone number must be 10 digits",
            "sendOtpFailed": "Unable to send OTP",
            "unexpected": "Unexpected error"
          }
        }'::jsonb
      ),
      (
        'default',
        'auth',
        'register',
        'en-US',
        1,
        '{
          "appName": "WrectifAI",
          "authModeLabel": "Phone + OTP authentication",
          "hero": {
            "kicker": "AUTOMOTIVE INTELLIGENCE",
            "title": "Experience Surgical Precision in Car Care.",
            "body": "Join the elite ecosystem of automotive specialists and car enthusiasts driving the future of service management."
          },
          "links": {
            "haveAccountPrefix": "Already have an account?",
            "haveAccountCta": "Login"
          },
          "form": {
            "title": "Create Account",
            "subtitle": "Start your journey with WrectifAI precision today.",
            "fullNameLabel": "Full Name *",
            "fullNamePlaceholder": "John Doe",
            "phoneLabel": "Phone Number *",
            "phonePlaceholder": "9876543210",
            "termsLabel": "I agree to the Terms and Privacy Policy *",
            "createAccountLabel": "Create Account",
            "sendingOtpLabel": "Sending OTP..."
          },
          "errors": {
            "fullNameRequired": "Full name is required",
            "phoneInvalid": "Phone number must be 10 digits",
            "termsRequired": "Please accept terms to continue",
            "sendOtpFailed": "Unable to send OTP",
            "unexpected": "Unexpected error"
          }
        }'::jsonb
      ),
      (
        'default',
        'auth',
        'verify',
        'en-US',
        1,
        '{
          "appName": "WrectifAI",
          "authModeLabel": "Phone + OTP authentication",
          "hero": {
            "kicker": "AUTOMOTIVE INTELLIGENCE",
            "title": "Verify Your Secure Access.",
            "body": "Security check for your account session."
          },
          "links": {
            "backToPrefix": "Back to",
            "backToRegisterCta": "Register",
            "backToLoginCta": "Login"
          },
          "form": {
            "title": "Verify OTP",
            "subtitleTemplate": "Please enter 6 digit OTP sent to {phone}.",
            "otpLabel": "OTP",
            "otpPlaceholder": "Please enter 6 digit OTP",
            "ctaLabel": "Verify and Continue",
            "ctaLoadingLabel": "Verifying..."
          },
          "errors": {
            "otpInvalid": "OTP must be 6 digits",
            "verifyFailed": "Unable to verify OTP",
            "unexpected": "Unexpected error"
          }
        }'::jsonb
      )
      ON CONFLICT (tenant_id, module, page, locale)
      DO UPDATE SET content = EXCLUDED.content, version = ui_content.version + 1, updated_at = NOW();
    `
  );
}
