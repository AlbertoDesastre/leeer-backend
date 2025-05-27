import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

// Puedo hacer mis propios decoradores para utilizarlos rápidamente en mis controladores
export const GetCreation = createParamDecorator((data, context: ExecutionContext) => {
  // El contexto tiene información de la request única que le está llegando y todos sus datos
  const request = context.switchToHttp().getRequest();
  const creation = request.creation; // ¿Por qué se que me llega una creación? El Guard (AuthorGuard) lo inserta.

  if (!creation)
    throw new InternalServerErrorException('La creación no se encontró en la request.');

  return creation;
});
