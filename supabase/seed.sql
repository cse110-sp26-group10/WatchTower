CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_auth_id UUID := gen_random_uuid();
  v_email TEXT := 'hyanglin@ucsd.edu';
  v_encrypted_password TEXT := crypt('password123', gen_salt('bf'));
  v_project_name TEXT := 'project123';
  v_website_url TEXT := 'https://cse110-sp26-group10.github.io/WatchTower/src/test-app/';
  v_user_id INT;
  v_project_id INT;
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
    updated_at
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
    NOW()
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

  INSERT INTO users (auth_id) VALUES (v_auth_id) RETURNING id INTO v_user_id;

  INSERT INTO projects (name, website_url) VALUES (v_project_name, v_website_url) RETURNING id INTO v_project_id;

  INSERT INTO users_projects (user_id, project_id) VALUES (v_user_id, v_project_id);

END $$;
