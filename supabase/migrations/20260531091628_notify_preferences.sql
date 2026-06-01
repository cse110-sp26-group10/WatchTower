alter table "public"."users" add column "notify_methods" text[] default '{push,email}'::text[];


