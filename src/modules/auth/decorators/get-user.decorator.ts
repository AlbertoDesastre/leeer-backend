import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

// Puedo hacer mis propios decoradores para utilizarlos rápidamente en mis controladores
export const GetUser = createParamDecorator((data, context: ExecutionContext) => {
  // El contexto tiene información de la request única que le está llegando y todos sus datos
  const request = context.switchToHttp().getRequest();
  const user = request.user; // ¿Por qué se que me llega un usuario? El Guard (AuthGuard) que ya está configurado con la estrategia JWT que definí en mi módulo, en su método validate, hace una búsqueda en BD con el usuario y retorna el usuario en caso de que exista. Lo devuelve como parte de la request y la request sigue su flujo hacia decoradores, rutas, etc.

  if (!user) throw new InternalServerErrorException('El usuario no se encontró en la request.');

  return user;
});
