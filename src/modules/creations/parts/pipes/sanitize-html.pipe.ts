import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import * as sanitize from 'sanitize-html';

@Injectable()
export class SanitizeHTML implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { content } = value;

    if (content === undefined)
      throw new BadRequestException('La parte debe venir en formato HTML y en un objeto con propiedad "content"');

    if (typeof content !== 'string') throw new BadRequestException('El contenido debe ser un string.');

    if (!content.includes('<') || !content.includes('>'))
      throw new BadRequestException(
        'El contenido de la historia debe estar en formato HTML. Comprueba el formato del contenido.',
      );

    const cleanHTML = sanitize(content, {
      allowedTags: ['header', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'p', 'i', 'span', 'strong', 'b', 'img'],
      allowedAttributes: {
        img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
      },
      disallowedTagsMode: 'completelyDiscard', // elimina TODO el contenido interno después de remover una etiqueta no deseada. Ejemplo: '<textarea>hola <p>adios</p> </textarea>' se quedará:'<p>adios</p>'
      enforceHtmlBoundary: true, // esto elimina cualquier información fuera del comienzo y cierre de la etiqueta <html> o </html>
    });

    return { ...value, content: cleanHTML };
  }
}
