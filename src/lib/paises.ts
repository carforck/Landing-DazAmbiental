/**
 * Indicativos telefónicos para el registro.
 *
 * Colombia va de primera porque es donde está el resort y será la respuesta de
 * la enorme mayoría; el resto sigue orden alfabético. La lista cubre América y
 * los orígenes habituales de huéspedes, no el mundo entero: una lista de
 * doscientas entradas hace más lento encontrar la propia.
 */
export interface Pais {
  /** Código ISO 3166-1 alfa-2, en mayúsculas. */
  iso: string;
  nombre: string;
  /** Indicativo con el signo más incluido. */
  indicativo: string;
}

export const PAISES: Pais[] = [
  { iso: "CO", nombre: "Colombia", indicativo: "+57" },
  { iso: "AR", nombre: "Argentina", indicativo: "+54" },
  { iso: "AW", nombre: "Aruba", indicativo: "+297" },
  { iso: "AU", nombre: "Australia", indicativo: "+61" },
  { iso: "BE", nombre: "Bélgica", indicativo: "+32" },
  { iso: "BO", nombre: "Bolivia", indicativo: "+591" },
  { iso: "BR", nombre: "Brasil", indicativo: "+55" },
  { iso: "CA", nombre: "Canadá", indicativo: "+1" },
  { iso: "CL", nombre: "Chile", indicativo: "+56" },
  { iso: "CR", nombre: "Costa Rica", indicativo: "+506" },
  { iso: "CU", nombre: "Cuba", indicativo: "+53" },
  { iso: "CW", nombre: "Curazao", indicativo: "+599" },
  { iso: "DK", nombre: "Dinamarca", indicativo: "+45" },
  { iso: "EC", nombre: "Ecuador", indicativo: "+593" },
  { iso: "SV", nombre: "El Salvador", indicativo: "+503" },
  { iso: "ES", nombre: "España", indicativo: "+34" },
  { iso: "US", nombre: "Estados Unidos", indicativo: "+1" },
  { iso: "FR", nombre: "Francia", indicativo: "+33" },
  { iso: "GT", nombre: "Guatemala", indicativo: "+502" },
  { iso: "HN", nombre: "Honduras", indicativo: "+504" },
  { iso: "IE", nombre: "Irlanda", indicativo: "+353" },
  { iso: "IT", nombre: "Italia", indicativo: "+39" },
  { iso: "JM", nombre: "Jamaica", indicativo: "+1876" },
  { iso: "MX", nombre: "México", indicativo: "+52" },
  { iso: "NI", nombre: "Nicaragua", indicativo: "+505" },
  { iso: "NO", nombre: "Noruega", indicativo: "+47" },
  { iso: "NL", nombre: "Países Bajos", indicativo: "+31" },
  { iso: "PA", nombre: "Panamá", indicativo: "+507" },
  { iso: "PY", nombre: "Paraguay", indicativo: "+595" },
  { iso: "PE", nombre: "Perú", indicativo: "+51" },
  { iso: "PT", nombre: "Portugal", indicativo: "+351" },
  { iso: "PR", nombre: "Puerto Rico", indicativo: "+1787" },
  { iso: "GB", nombre: "Reino Unido", indicativo: "+44" },
  { iso: "DO", nombre: "República Dominicana", indicativo: "+1809" },
  { iso: "DE", nombre: "Alemania", indicativo: "+49" },
  { iso: "CH", nombre: "Suiza", indicativo: "+41" },
  { iso: "TT", nombre: "Trinidad y Tobago", indicativo: "+1868" },
  { iso: "UY", nombre: "Uruguay", indicativo: "+598" },
  { iso: "VE", nombre: "Venezuela", indicativo: "+58" },
];

/**
 * Bandera a partir del código ISO.
 *
 * Se calcula en vez de guardarse: cada letra se traduce a su símbolo indicador
 * regional y el par forma la bandera. Así agregar un país es una línea con su
 * código, sin pegar caracteres que en muchos editores se ven como cajas.
 */
export function bandera(iso: string): string {
  return String.fromCodePoint(
    ...[...iso.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

export const PAIS_POR_DEFECTO = PAISES[0];
