import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponseDto {
  @ApiProperty({
    example: '40afee0f-dad9-470e-ac2d-44f4e339ac0a',
    description: 'ID único del usuario',
    uniqueItems: true,
  })
  user_id: string;

  @ApiProperty({
    example: 'autor123',
    description: 'Nickname del usuario',
    uniqueItems: true,
  })
  nickname: string;

  @ApiProperty({
    example: 'autor@email.com',
    description: 'Email del usuario',
    uniqueItems: true,
  })
  email: string;

  @ApiProperty({
    example: 'https://example.com/thumbnails/viaje.jpg',
    description: 'URL de la foto de perfil',
  })
  profile_picture: string;

  @ApiProperty({ example: 'Escritor de novelas...', description: 'Descripción del usuario' })
  description: string;
}
