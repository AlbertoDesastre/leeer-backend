import { ApiProperty } from '@nestjs/swagger';

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { CreationCollaboration } from '@/modules/creations/collaborations/entities/creation-collaboration.entity';
import { Creation } from '@/modules/creations/entities/creation.entity';
import { Part } from '@/modules/creations/parts/entities/part.entity';

/* @Entity marca la tabla real de la BD "users" para hacer las transacciones. El resto de decoradores son autodefinitorios. */
@Entity('users')
export class User {
  @ApiProperty({
    example: '40afee0f-dad9-470e-ac2d-44f4e339ac0a',
    description: 'ID único del usuario',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @ApiProperty({
    example: 'autor123',
    description: 'Nickname del usuario',
    uniqueItems: true,
  })
  @Column()
  nickname: string;

  @ApiProperty({
    example: 'autor@email.com',
    description: 'Email del usuario',
    uniqueItems: true,
  })
  @Column()
  email: string;

  @ApiProperty({
    example: 'https://example.com/thumbnails/viaje.jpg',
    description: 'URL de la foto de perfil',
  })
  @Column()
  profile_picture: string;

  @ApiProperty({ example: 'Escritor de novelas...', description: 'Descripción del usuario' })
  @Column()
  description: string;

  @ApiProperty({ example: '********', description: 'Contraseña (encriptada)' })
  @Column({ select: false })
  password: string;

  // relación con las creaciones + breve explicación de la sintaxis
  @OneToMany(
    () => Creation, // primero le asigno la Entidad objetivo
    (creation) => creation.user, // luego, dentro de esa entidad, por qué propiedad está conectada
    { cascade: true }, // y finalmente delete on cascade: cuando se elimine este usuario elimina todas sus creaciones
  )
  @ApiProperty({ description: 'Creaciones asociadas al usuario', type: () => Creation })
  creations?: Creation[];

  @OneToMany(() => CreationCollaboration, (creationCollaboration) => creationCollaboration.user, {
    cascade: true,
  })
  // TODO: Revisar si esta llamada devuelve todas las solicitudes hechas o mandadas o si es una u otra
  @ApiProperty({
    description: 'Todas las peticiones de colaboración que ha revisado y enviado',
    type: () => CreationCollaboration,
  })
  creation_collaborations?: CreationCollaboration[];

  @OneToMany(
    () => Part, // entidad objetivo
    (part) => part.user, // por qué propiedad está conectada
    {
      cascade: true,
    },
  )
  // TODO: Revisar si las partes que se devulven del usuario efectivamente son las qeu escribe en cualquier obra, creación o colaboración
  @ApiProperty({
    description:
      'Todas las partes que ha escrito el usuario, incluyendo colaboraciones con otras obras',
    type: () => Part,
  })
  parts?: Part[];
}
