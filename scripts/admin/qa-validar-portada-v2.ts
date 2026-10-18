import assert from "node:assert/strict";
import { validarPortada, MAX_COVER_BYTES } from "../../src/lib/admin/validar-portada";
const webp = Uint8Array.from([82,73,70,70,0,0,0,0,87,69,66,80]);
const png = Uint8Array.from([137,80,78,71,13,10,26,10]);
const jpg = Uint8Array.from([255,216,1,2,255,217]);
assert.match(validarPortada("armaf-club-de-nuit","foto.webp","image/webp",webp).storagePath,
  /^covers\/armaf-club-de-nuit\/[0-9a-f-]+\.webp$/);
assert.equal(validarPortada("fragancia-1","foto.png","image/png",png).extension,"png");
assert.equal(validarPortada("fragancia-1","foto.jpeg","image/jpeg",jpg).extension,"jpg");
assert.throws(() => validarPortada("../hack","foto.webp","image/webp",webp));
assert.throws(() => validarPortada("fragancia-1","foto.png","image/png",webp));
assert.throws(() => validarPortada("fragancia-1","foto.webp","image/jpeg",webp));
assert.throws(() => validarPortada("fragancia-1","foto.webp","image/webp",new Uint8Array(0)));
assert.throws(() => validarPortada("fragancia-1","foto.webp","image/webp",new Uint8Array(MAX_COVER_BYTES+1)));
assert.throws(() => validarPortada("fragancia-1","foto.webp","image/webp",Uint8Array.from([1,2,3,4])));
console.log("OK: validación de formato, extensión, MIME, peso y ruta de portada.");
