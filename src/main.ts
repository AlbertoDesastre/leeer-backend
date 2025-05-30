import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Un Pipe es una función que transforma o valida datos justo antes de llamar a la ruta.  La ruta recibirá la data ya transformada (si sufrió alguna)
  // Hacer uso de GlobalPipes significa que estas Pipes se activarán justo antes de TODAS las rutas de la app.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  // whitelist --> cualquier dato que reciba y no esté incluido en el DTO lo elimina directamente | forbidNonWhiteListed --> Lanza error si recibe algún dato no incluido en el DTO correspondiente

  // Esto habilita CORS para que me lleguen peticiones de cualquier sitio (de momento, de mi local en mi otro proyecto Front)
  app.enableCors({
    origin: true, // Cualquier origen se acepta
    credentials: true, // Me deja usar cookies y autenticación
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
