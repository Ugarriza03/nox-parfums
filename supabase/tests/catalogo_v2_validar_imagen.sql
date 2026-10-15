-- Prueba transaccional: aislamiento de imagen por slug y existencia real.
begin;
insert into storage.objects (bucket_id,name) values
('nox-catalog-covers','covers/qa-uno/archivo.webp');

insert into public.catalog_products
  (slug,house,fragrance_name,gender,universe,origin,status,image_path)
values ('qa-uno','Casa QA','Uno','unisex','nicho','internacional','draft',
        'covers/qa-uno/archivo.webp');

do $$
begin
  if not public.nox_catalog_validar_imagen('qa-uno','covers/qa-uno/archivo.webp') then
    raise exception 'Imagen propia no aceptada';
  end if;
  if public.nox_catalog_validar_imagen('qa-dos','covers/qa-uno/archivo.webp') then
    raise exception 'Se permitió imagen ajena';
  end if;
  if public.nox_catalog_validar_imagen('qa-uno','covers/qa-uno/inexistente.webp') then
    raise exception 'Se permitió imagen inexistente';
  end if;
  if not public.nox_catalog_validar_imagen('qa-uno',null) then
    raise exception 'Se rechazó portada local sin image_path';
  end if;
  begin
    update public.catalog_products set image_path='covers/qa-otro/archivo.webp'
    where slug='qa-uno';
    raise exception 'No se rechazó ruta ajena';
  exception when sqlstate 'NX422' then null;
  end;
  begin
    update public.catalog_products set image_path='covers/qa-uno/inexistente.webp'
    where slug='qa-uno';
    raise exception 'No se rechazó imagen inexistente';
  exception when sqlstate 'NX422' then null;
  end;
  begin
    insert into public.catalog_revisions (product_slug, proposed_data, proposed_by, base_updated_at)
    values ('qa-uno', '{"image_path":"covers/qa-otro/archivo.webp"}'::jsonb,
      '00000000-0000-0000-0000-00000000000a', now());
    raise exception 'No se rechazó revisión con imagen ajena';
  exception when sqlstate 'NX422' then null;
  end;
end $$;

rollback;
