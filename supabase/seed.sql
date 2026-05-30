CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_auth_id UUID := '43ec5a9a-74bb-460a-b368-4767846455e0'; -- gen_random_uuid();
  v_alert_id UUID := '7a5c08e9-b869-49f1-89be-57a619363448'; -- gen_random_uuid();
  v_email TEXT := 'hyanglin@ucsd.edu';
  v_encrypted_password TEXT := extensions.crypt('password123', extensions.gen_salt('bf'));
  v_project_name TEXT := 'project123';
  v_website_url TEXT := 'https://cse110-sp26-group10.github.io/WatchTower/src/test-app/';
  v_user_id INT;
  v_project_id INT;
  v_project_api_key UUID := 'b23b3210-3597-45ad-8484-14936a967760';
BEGIN

  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    is_sso_user,
    is_anonymous
  )
  VALUES (
    v_auth_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    v_encrypted_password,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name": "Demo", "last_name": "User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    FALSE,
    FALSE
  );

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    v_auth_id,
    v_auth_id,
    jsonb_build_object('sub', v_auth_id, 'email', v_email),
    'email',
    v_auth_id,
    NOW(),
    NOW(),
    NOW()
  );

  INSERT INTO users (auth_id, alert_id) VALUES (v_auth_id, v_alert_id) RETURNING id INTO v_user_id;

  INSERT INTO projects (name, website_url, api_key) VALUES (v_project_name, v_website_url, v_project_api_key) RETURNING id INTO v_project_id;

  INSERT INTO users_projects (user_id, project_id) VALUES (v_user_id, v_project_id);

END $$;
