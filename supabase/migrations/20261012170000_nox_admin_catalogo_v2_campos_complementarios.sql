-- NOX Admin V2: conservar campos complementarios del Product original.
-- Migración aditiva, sin backfill, sin tocar stock, slugs ni publicaciones.
-- NO ejecutar en producción hasta aprobar la migración completa.
begin;

alter table public.catalog_products
  add column inspired_label text,
  add column data_status text,
  add column performance jsonb,
  add column description text;

alter table public.catalog_products
  add constraint catalog_data_status_valid
    check (data_status is null or data_status in ('verificado', 'pendiente')),
  add constraint catalog_performance_object
    check (performance is null or jsonb_typeof(performance) = 'object'),
  add constraint catalog_description_length
    check (description is null or char_length(description) <= 5000),
  add constraint catalog_inspired_label_length
    check (inspired_label is null or char_length(inspired_label) <= 500);

comment on column public.catalog_products.performance is
  'Rendimiento NOX: solo mediciones verificadas; no inferir de fragancias originales.';
comment on column public.catalog_products.description is
  'Texto editorial opcional. No inventar descripciones para el catálogo histórico.';
comment on column public.catalog_products.inspired_label is
  'Etiqueta original preservada para paridad con Product.inspiredLabel.';
comment on column public.catalog_products.data_status is
  'Estado original de verificación del perfil olfativo.';

commit;
