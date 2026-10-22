import type { RolUsuario } from '../types'

/*
 * Roles y permisos PROVISIONALES del panel. Son una propuesta para el documento de
 * autenticación y roles (tarea I5): todavía no hay inicio de sesión, así que el panel los
 * muestra pero no los aplica.
 */

export const roles: RolUsuario[] = ['administrador', 'editor', 'revisor']

export const rolLabels: Record<RolUsuario, string> = {
  administrador: 'Administración',
  editor: 'Edición',
  revisor: 'Revisión',
}

export const rolDescripciones: Record<RolUsuario, string> = {
  administrador: 'Gestiona usuarios, configuración y todo el catálogo.',
  editor: 'Crea y edita servicios y sus fuentes, y los envía a revisión.',
  revisor: 'Revisa la información y decide si se publica o se devuelve.',
}

export const permisos: { accion: string; roles: RolUsuario[] }[] = [
  { accion: 'Ver el panel y el Observatorio', roles: ['administrador', 'editor', 'revisor'] },
  { accion: 'Crear y editar servicios', roles: ['administrador', 'editor'] },
  { accion: 'Añadir, quitar y actualizar fuentes', roles: ['administrador', 'editor'] },
  { accion: 'Enviar a revisión', roles: ['administrador', 'editor'] },
  { accion: 'Publicar, devolver o marcar no vigente', roles: ['administrador', 'revisor'] },
  { accion: 'Gestionar usuarios', roles: ['administrador'] },
  { accion: 'Cambiar la configuración', roles: ['administrador'] },
]
