import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  // reflector permite leer cualquier metadata que haya sido incluida a través de los decorators, se hace pasándole el nombre del metadato más el contexto. Fuente: https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles: string[] = this.reflector.get('roles', context.getHandler());

    console.log(roles);
    return true;
  }
}
