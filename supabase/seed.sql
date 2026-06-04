CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  -- Local project
  v_project_name_local TEXT := 'Local Test App';
  v_website_url_local TEXT := 'http://127.0.0.1:5500/src/test-app/';
  v_project_id_local INT;
  v_project_api_key_local UUID := '00000000-0000-0000-0000-000000000000';
  -- Deployed project
  v_project_name_deployed TEXT := 'Deployed Test App';
  v_website_url_deployed TEXT := 'https://cse110-sp26-group10.github.io/WatchTower/src/test-app/';
  v_project_id_deployed INT;
  v_project_api_key_deployed UUID := '00000000-0000-0000-0000-000000000001';
  -- Test user
  v_auth_id_test UUID := '10000000-0000-0000-0000-000000000000';
  v_alert_id_test UUID := '20000000-0000-0000-0000-000000000000';
  v_email_test TEXT := 'test@ucsd.edu';
  v_encrypted_password_test TEXT := extensions.crypt('password', extensions.gen_salt('bf'));
  v_user_id_test INT;
  -- First user (Han)
  v_auth_id_1 UUID := '10000000-0000-0000-0000-000000000001'; -- gen_random_uuid();
  v_alert_id_1 UUID := '20000000-0000-0000-0000-000000000001'; -- gen_random_uuid();
  v_email_1 TEXT := 'hyanglin@ucsd.edu';
  v_encrypted_password_1 TEXT := extensions.crypt('password', extensions.gen_salt('bf'));
  v_user_id_1 INT;
  -- Second user (Kevin), co-owner of the same project. Subscribe ntfy to v_alert_id2.
  v_auth_id_2 UUID := '10000000-0000-0000-0000-000000000002';
  v_alert_id_2 UUID := '20000000-0000-0000-0000-000000000002';
  v_email_2 TEXT := 'xuw040@ucsd.edu';
  v_encrypted_password_2 TEXT := extensions.crypt('password', extensions.gen_salt('bf'));
  v_user_id_2 INT;
BEGIN

  -- Local project
  INSERT INTO projects (name, website_url, api_key) VALUES (v_project_name_local, v_website_url_local, v_project_api_key_local) RETURNING id INTO v_project_id_local;
  
  -- Deployed project
  INSERT INTO projects (name, website_url, api_key) VALUES (v_project_name_deployed, v_website_url_deployed, v_project_api_key_deployed) RETURNING id INTO v_project_id_deployed;

  -- Test user
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
    v_auth_id_test,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email_test,
    v_encrypted_password_test,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name": "Test", "last_name": "User"}',
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
    v_auth_id_test,
    v_auth_id_test,
    jsonb_build_object('sub', v_auth_id_test, 'email', v_email_test),
    'email',
    v_auth_id_test,
    NOW(),
    NOW(),
    NOW()
  );

  INSERT INTO users (auth_id, alert_id) VALUES (v_auth_id_test, v_alert_id_test) RETURNING id INTO v_user_id_test;

  INSERT INTO users_projects (user_id, project_id) VALUES (v_user_id_test, v_project_id_local);
  
  INSERT INTO users_projects (user_id, project_id) VALUES (v_user_id_test, v_project_id_deployed);

  -- First user (Han)
  
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
    v_auth_id_1,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email_1,
    v_encrypted_password_1,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name": "Han", "last_name": "Yang-Lin"}',
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
    v_auth_id_1,
    v_auth_id_1,
    jsonb_build_object('sub', v_auth_id_1, 'email', v_email_1),
    'email',
    v_auth_id_1,
    NOW(),
    NOW(),
    NOW()
  );

  INSERT INTO users (auth_id, alert_id) VALUES (v_auth_id, v_alert_id) RETURNING id INTO v_user_id_1;

  INSERT INTO users_projects (user_id, project_id) VALUES (v_user_id_1, v_project_id_local);

  -- Second user (Kevin): same project, separate alert_id + email.
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
    v_auth_id_2,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email_2,
    v_encrypted_password_2,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name": "Kevin", "last_name": "Wang"}',
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
    v_auth_id_2,
    v_auth_id_2,
    jsonb_build_object('sub', v_auth_id_2, 'email', v_email_2),
    'email',
    v_auth_id_2,
    NOW(),
    NOW(),
    NOW()
  );

  INSERT INTO users (auth_id, alert_id) VALUES (v_auth_id_2, v_alert_id_2) RETURNING id INTO v_user_id_2;

  INSERT INTO users_projects (user_id, project_id) VALUES (v_user_id_2, v_project_id_local);

END $$;
