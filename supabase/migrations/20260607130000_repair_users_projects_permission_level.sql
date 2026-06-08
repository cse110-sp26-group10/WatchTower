alter table "public"."users_projects"
  add column if not exists "permission_level" text;

update "public"."users_projects"
set "permission_level" = 'Owner'
where "permission_level" is null;

alter table "public"."users_projects"
  alter column "permission_level" set default 'Owner',
  alter column "permission_level" set not null;
