import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { USER_ROLES } from '../decorators/decorators.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  // reflector permite leer cualquier metadata que haya sido incluida a través de los decorators, se hace pasándole el nombre del metadato más el contexto. Fuente: https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const userRoles: string[] = this.reflector.get(USER_ROLES, context.getHandler());

    const request = context.switchToHttp().getRequest();
    const user = request.user as any; // quitar este any que solo lo quiero para hacer pruebas. Los roles los verificaré en base a una consulta en BBDD

    if (!userRoles) return true; // si no se incluyeron roles en el Decorator es que puede pasar todo el mundo
    if (userRoles.length === 0) return true; // misma lógica que arriba

    if (user.roles) {
      for (const role of user.roles) {
        if (userRoles.includes(role)) return true; // Esto recorre todos los roles que trae el usuario. Por ejemplo, si el Guard solo permite "colaboradores", buscará todos los roles del usuario hasta encontrarlo. Si no lo tiene es que no tiene permitido pasar, de lo contrario sí. Esto será clave cuando quiera identificar usuarios colaboradores (que no pueden eliminar obras que no son suyas) y autores originales.
      }
    }

    throw new ForbiddenException('No tienes permitido ver este recurso.'); // Si después de todo este rollo el usuario no tiene un rol válido para lo que intenta acceder se le echa.
  }
}
