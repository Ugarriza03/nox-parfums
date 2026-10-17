-- Limpieza V2: deshabilitar DELETE directo de Storage.
-- La política inicial permitía borrar objetos sin comprobación atómica de referencias.
-- Hasta diseñar una eliminación transaccional segura, el bucket será de sólo
-- lectura/escritura para administradores, sin borrado desde el cliente.
begin;
drop policy if exists "nox catalog covers admin delete" on storage.objects;
commit;
