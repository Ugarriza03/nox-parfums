-- Correct SQL NULL handling for JSON null in staged performance.
-- A JSON null must not violate catalog_performance_object on approval.
begin;
create or replace function public.nox_catalog_aplicar_complementos_revision()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_data jsonb;
begin
 select proposed_data into v_data from public.catalog_revisions where product_slug=new.slug;
 if v_data is null then return new; end if;
 if v_data ? 'description' then new.description := v_data->>'description'; end if;
 if v_data ? 'inspired_label' then new.inspired_label := v_data->>'inspired_label'; end if;
 if v_data ? 'data_status' then new.data_status := v_data->>'data_status'; end if;
 if v_data ? 'performance' then
  new.performance := case when jsonb_typeof(v_data->'performance')='null'
   then null else v_data->'performance' end;
 end if;
 return new;
end;
$$;
commit;
