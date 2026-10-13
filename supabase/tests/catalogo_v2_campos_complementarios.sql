-- Prueba aditiva: los nuevos campos no alteran el flujo existente.
begin;
do $$
declare
  v_total integer;
begin
  select count(*) into v_total
  from information_schema.columns
  where table_schema='public' and table_name='catalog_products'
    and column_name in ('inspired_label','data_status','performance','description');
  if v_total <> 4 then
    raise exception 'Faltan campos complementarios del catálogo V2';
  end if;
  if (select relrowsecurity from pg_class where oid='public.catalog_products'::regclass) is not true then
    raise exception 'RLS de catálogo deshabilitada';
  end if;
  if has_table_privilege('anon', 'public.catalog_products', 'SELECT') then
    raise exception 'Se expusieron productos a anon';
  end if;
end $$;

insert into public.catalog_products
  (slug,house,fragrance_name,gender,universe,origin,status,inspired_label,data_status,performance)
values
  ('qa-campos-complementarios','QA','Campos','unisex','pendiente','internacional','draft',
   'Inspirado en QA Campos','pendiente',
   '{"verified":false,"longevity":null,"projection":null,"sillage":null,"performanceIntensity":null,"testedAt":null,"notes":null}'::jsonb);

do $$
begin
  if (select performance->>'verified' from public.catalog_products
      where slug='qa-campos-complementarios') <> 'false' then
    raise exception 'Se alteró el estado de verificación de performance';
  end if;
  if (select status from public.catalog_products
      where slug='qa-campos-complementarios') <> 'draft' then
    raise exception 'Se publicó un borrador accidentalmente';
  end if;
end $$;
rollback;
