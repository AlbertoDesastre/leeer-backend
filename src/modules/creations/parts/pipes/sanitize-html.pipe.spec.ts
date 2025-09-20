import { BadRequestException } from '@nestjs/common';
import { SanitizeHTML } from './sanitize-html.pipe';

describe('SanitizeHTML (Pipe)', () => {
  let pipe: SanitizeHTML;

  beforeEach(() => {
    pipe = new SanitizeHTML();
  });

  test("it should still throw if value doesn't contain 'content' property", () => {
    let wrongObject = { text: 'Hola que tal' };

    expect(() => pipe.transform(wrongObject, {} as any)).toThrow(BadRequestException);
    expect(() => pipe.transform(wrongObject, {} as any)).toThrow(
      'La parte debe venir en formato HTML y en un objeto con propiedad "content"',
    );
  });

  test('it should throw if input is not an HTML', () => {
    let incorrectFormat = { content: 'Hola que tal' };

    expect(() => pipe.transform(incorrectFormat, {} as any)).toThrow(BadRequestException);
    expect(() => pipe.transform(incorrectFormat, {} as any)).toThrow(
      'El contenido de la historia debe estar en formato HTML. Comprueba el formato del contenido.',
    );
  });

  test('it should return the same content if input is already sanitized and valid', () => {
    let validHTML = {
      content:
        '<header><h2>El viaje</h2></header><p>Este es un <strong>párrafo válido</strong> con <i>cursivas</i>.</p>',
    };

    expect(() => pipe.transform(validHTML, {} as any)).not.toThrow(BadRequestException);
    expect(pipe.transform(validHTML, {} as any)).toEqual(validHTML);
  });

  test('it should return a sanitized HTML, not saving unwanted HTML tags configured', () => {
    let unsanitazedHTML = {
      content:
        "<script>alert('hack');</script> <a href='www.superhackerlink.com'>Clicka porfi </a> " +
        "<img loading=''/>" +
        '<p>Este es el inicio de la historia con <b>negrita</b></p>',
    };
    let sanitizedHTML = {
      content: '<img /><p>Este es el inicio de la historia con <b>negrita</b></p>',
    };

    const { content } = pipe.transform(unsanitazedHTML, {} as any);

    expect(() => pipe.transform(unsanitazedHTML, {} as any)).not.toThrowError();
    expect(content).not.toEqual(unsanitazedHTML);
    expect(content).not.toContain("<img loading=''/>");
    expect(content).not.toContain("<script>alert('hack');</script>");
    expect(content).not.toContain('Clicka porfi'); // <-- El texto contenido en etiquetas no deseadas también debería ser eliminado!
    expect(content).not.toContain('href'); // <-- El texto contenido en etiquetas no deseadas también debería ser eliminado!
    expect(content).toContain('<img />'); // <-- El atributo no deseado de img se va, pero la etiqueta permanece
    expect(content).toEqual(sanitizedHTML.content);
  });

  test('it should return a sanitized HTML, not saving unwanted HTML tags configured', () => {
    let unsanitazedHTML = {
      content: "<a href='www.superhackerlink.com'>Clicka porfi </a> <p>¡Hola!</p> ",
    };

    const { content } = pipe.transform(unsanitazedHTML, {} as any);

    expect(content).not.toContain('Clicka porfi'); // <-- El texto contenido en etiquetas no deseadas también debería ser eliminado!
  });
});
