export const hasRole       = (roles: string[], role: string) => roles.includes(role)
export const isAdmin       = (roles: string[]) => roles.includes('admin')
export const isRH          = (roles: string[]) => roles.includes('rh')
export const isGestor      = (roles: string[]) => roles.includes('gestor')
export const isColaborador = (roles: string[]) => roles.includes('colaborador')
export const isAtendente   = (roles: string[]) => roles.includes('atendente')

export const podeVerRH        = (roles: string[]) => isAdmin(roles) || isRH(roles) || isGestor(roles)
export const podeEditarRH     = (roles: string[]) => isAdmin(roles) || isRH(roles)
export const podeAcessarAdmin = (roles: string[]) => isAdmin(roles)
export const apenasPerfilProprio = (roles: string[]) =>
  !isAdmin(roles) && !isRH(roles) && !isGestor(roles)
