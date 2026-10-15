-- Campos editoriales V2: edición de borradores o propuesta para fichas publicadas.
-- No modifica el catálogo público ni el stock; los cambios publicados requieren aprobación.
begin;
create function public.nox_catalog_guardar_complementos(
 p_slug text, p_description text, p_inspired_label text, p_data_status text, p_performance jsonb
) returns void language plpgsql volatile security definer set search_path = ''
as $$
declare
 v_uid uuid := auth.uid();
 v_actual public.catalog_products;
 v_nuevo public.catalog_products;
 v_revision public.catalog_revisions;
 v_propuesta jsonb;
begin
 if v_uid is null or not public.is_admin() or coalesce(auth.jwt()->>'aal','') <> 'aal2' then
  raise exception 'Se requiere administrador con MFA.' using errcode='NX401';
 end if;
 if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug)>120
    or (p_description is not null and length(p_description)>5000)
    or (p_inspired_label is not null and length(p_inspired_label)>500)
    or (p_data_status is not null and p_data_status not in ('verificado','pendiente'))
    or (p_performance is not null and jsonb_typeof(p_performance)<>'object') then
  raise exception 'Datos editoriales inválidos.' using errcode='NX422';
 end if;
 select * into v_actual from public.catalog_products where slug=p_slug for update;
 if not found then raise exception 'Fragancia inexistente.' using errcode='NX404'; end if;
 if v_actual.status='draft' then
  if (v_actual.description,v_actual.inspired_label,v_actual.data_status,v_actual.performance)
   is not distinct from (p_description,p_inspired_label,p_data_status,p_performance) then return; end if;
  update public.catalog_products set description=p_description,inspired_label=p_inspired_label,
   data_status=p_data_status,performance=p_performance,updated_at=now(),updated_by=v_uid
   where slug=p_slug returning * into v_nuevo;
  insert into public.catalog_change_log(product_slug,actor_id,action,before_data,after_data)
   values(p_slug,v_uid,'update',to_jsonb(v_actual),to_jsonb(v_nuevo));
 elsif v_actual.status='published' then
  select * into v_revision from public.catalog_revisions where product_slug=p_slug for update;
  if not found then
   -- A new complementary-only revision still contains the complete original base fields.
   v_propuesta := jsonb_build_object('house',v_actual.house,
    'fragrance_name',v_actual.fragrance_name,'gender',v_actual.gender,
    'universe',v_actual.universe,'origin',v_actual.origin,
    'olfactory',v_actual.olfactory,'image_path',v_actual.image_path);
  else
   if v_revision.base_updated_at <> v_actual.updated_at then
    raise exception 'Revisión desactualizada.' using errcode='NX409';
   end if;
   v_propuesta := v_revision.proposed_data;
  end if;
  v_propuesta := v_propuesta || jsonb_build_object(
   'description',p_description,'inspired_label',p_inspired_label,
   'data_status',p_data_status,'performance',p_performance);
  insert into public.catalog_revisions(product_slug,proposed_data,proposed_by,base_updated_at)
   values(p_slug,v_propuesta,v_uid,v_actual.updated_at)
   on conflict(product_slug) do update set proposed_data=excluded.proposed_data,
    proposed_by=excluded.proposed_by,proposed_at=now(),base_updated_at=excluded.base_updated_at;
 else
  raise exception 'Estado no editable.' using errcode='NX409';
 end if;
end;
$$;
revoke all on function public.nox_catalog_guardar_complementos(text,text,text,text,jsonb) from public,anon;
grant execute on function public.nox_catalog_guardar_complementos(text,text,text,text,jsonb) to authenticated;

-- Mantener campos complementarios durante la aprobación sin alterar
-- el comportamiento de los campos originales de la revisión.
create function public.nox_catalog_aplicar_complementos_revision()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_data jsonb;
begin
 select proposed_data into v_data from public.catalog_revisions where product_slug=new.slug;
 if v_data is null then return new; end if;
 if v_data ? 'description' then new.description := v_data->>'description'; end if;
 if v_data ? 'inspired_label' then new.inspired_label := v_data->>'inspired_label'; end if;
 if v_data ? 'data_status' then new.data_status := v_data->>'data_status'; end if;
 if v_data ? 'performance' then new.performance := v_data->'performance'; end if;
 return new;
end;
$$;
revoke all on function public.nox_catalog_aplicar_complementos_revision() from public,anon,authenticated;
create trigger nox_catalog_aplicar_complementos_revision
before update of house,fragrance_name,gender,universe,origin,olfactory,image_path
on public.catalog_products for each row
execute function public.nox_catalog_aplicar_complementos_revision();
commit;
