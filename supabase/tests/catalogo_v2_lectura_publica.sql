-- Lectura pública V2: anon sólo ve published, sin revisiones ni tablas.
begin;
do $$
declare v_actor uuid := '00000000-0000-0000-0000-00000000000a';
begin
 perform set_config('request.jwt.claims',json_build_object('sub',v_actor,'role','authenticated','aal','aal2')::text,true);
 perform public.nox_catalog_crear_borrador('qa-publico-visible','QA','Visible','unisex','nicho','internacional');
 perform public.nox_catalog_cambiar_estado('qa-publico-visible','published');
 perform public.nox_catalog_crear_borrador('qa-publico-borrador','QA','Borrador','unisex','nicho','internacional');
 perform public.nox_catalog_crear_borrador('qa-publico-oculto','QA','Oculto','unisex','nicho','internacional');
 perform public.nox_catalog_cambiar_estado('qa-publico-oculto','published');
 perform public.nox_catalog_cambiar_estado('qa-publico-oculto','hidden');
 perform public.nox_catalog_crear_borrador('qa-publico-archivado','QA','Archivado','unisex','nicho','internacional');
 perform public.nox_catalog_cambiar_estado('qa-publico-archivado','archived');
 perform public.nox_catalog_guardar_revision('qa-publico-visible','QA','SIN APROBAR','unisex','nicho','internacional',null,null);
end $$;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$
declare v_n integer; v_nombre text;
begin
 select count(*) into v_n from public.nox_catalogo_publico() where slug like 'qa-publico-%';
 if v_n <> 1 then raise exception 'anon debía ver 1 ficha publicada, vio %', v_n; end if;
 select fragrance_name into v_nombre from public.nox_catalogo_publico() where slug='qa-publico-visible';
 if v_nombre <> 'Visible' then raise exception 'Revisión pendiente filtrada: %', v_nombre; end if;
 if exists(select 1 from public.nox_catalogo_publico() where status <> 'published') then
  raise exception 'Estado no publicado expuesto';
 end if;
 begin
  perform 1 from public.catalog_products limit 1;
  raise exception 'anon leyó catalog_products';
 exception when insufficient_privilege then null;
 end;
 begin
  perform 1 from public.catalog_revisions limit 1;
  raise exception 'anon leyó catalog_revisions';
 exception when insufficient_privilege then null;
 end;
 begin
  perform 1 from public.catalog_change_log limit 1;
  raise exception 'anon leyó auditoría';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
do $$
declare v_cols text;
begin
 select string_agg(a, ',' order by a) into v_cols
 from unnest((select proargnames from pg_proc where proname='nox_catalogo_publico')) a;
 if v_cols <> 'data_status,fragrance_name,gender,house,image_path,inspired_label,olfactory,origin,performance,slug,status,universe' then
  raise exception 'Columnas inesperadas: %', v_cols;
 end if;
 if exists(select 1 from pg_proc where proname='nox_catalogo_publico' and provolatile <> 's') then
  raise exception 'La RPC debe ser STABLE';
 end if;
 raise notice 'OK: RPC pública filtra publicados, sin revisiones ni tablas';
end $$;
rollback;
