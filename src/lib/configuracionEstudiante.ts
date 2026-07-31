// Lógica pura de la configuración del estudiante (cooldown del nombre y
// validaciones), extraída de FormConfiguracion para poder testearla.

/** Días de espera antes de poder volver a editar el nombre. */
export const DIAS_COOLDOWN_NOMBRE = 30;
/** Longitud mínima de una contraseña nueva. */
export const MIN_LONGITUD_PASSWORD = 8;

type FechaLike = Date | string | null | undefined;

/** ¿El nombre está en periodo de espera (modificado hace menos de 30 días)? */
export function estaEnCooldownNombre(nombreModificadoAt: FechaLike): boolean {
  if (!nombreModificadoAt) return false;
  const diffMs = Date.now() - new Date(nombreModificadoAt).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays < DIAS_COOLDOWN_NOMBRE;
}

/** Fecha (formateada es-MX) en que termina el cooldown; "" si no aplica. */
export function fechaFinCooldownNombre(nombreModificadoAt: FechaLike): string {
  if (!nombreModificadoAt) return "";
  const releaseDate = new Date(nombreModificadoAt);
  releaseDate.setDate(releaseDate.getDate() + DIAS_COOLDOWN_NOMBRE);
  return releaseDate.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type ErroresValidacion = { [key: string]: string };

/** Valida los datos personales/académicos; devuelve el mapa de errores (vacío si todo OK). */
export function validarDatosPersonales(datos: {
  nombre: string;
  apellidoPaterno: string;
  carreraId: number | null | undefined;
}): ErroresValidacion {
  const errores: ErroresValidacion = {};
  if (!datos.nombre.trim()) errores.nombre = "El nombre es requerido";
  if (!datos.apellidoPaterno.trim()) errores.apellidoPaterno = "El apellido paterno es requerido";
  if (!datos.carreraId) errores.carreraId = "Selecciona tu carrera";
  return errores;
}

/** Valida el cambio de contraseña; devuelve el mapa de errores (vacío si todo OK). */
export function validarPassword(datos: {
  passwordActual: string;
  passwordNuevo: string;
  confirmarPasswordNuevo: string;
}): ErroresValidacion {
  const errores: ErroresValidacion = {};
  if (!datos.passwordActual) errores.passwordActual = "La contraseña actual es requerida";
  if (!datos.passwordNuevo) {
    errores.passwordNuevo = "La nueva contraseña es requerida";
  } else if (datos.passwordNuevo.length < MIN_LONGITUD_PASSWORD) {
    errores.passwordNuevo = "Debe tener al menos 8 caracteres";
  }
  if (datos.passwordNuevo !== datos.confirmarPasswordNuevo) {
    errores.confirmarPasswordNuevo = "Las contraseñas no coinciden";
  }
  return errores;
}
