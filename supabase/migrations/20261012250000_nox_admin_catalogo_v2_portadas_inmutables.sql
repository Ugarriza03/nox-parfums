-- Las portadas privadas son inmutables: nunca sobrescribir un objeto existente.
-- Una corrección de portada debe crear un archivo nuevo y una revisión auditada.
-- DELETE ya fue bloqueado en la migración anterior.
begin;
drop policy if exists "nox catalog covers admin update" on storage.objects;
commit;
