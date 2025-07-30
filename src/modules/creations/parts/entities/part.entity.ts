import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Creation } from '@/modules/creations/entities/creation.entity';
import { User } from '@/modules/users/entities/user.entity';

/* @Entity marca la tabla real de la BD "creations" para hacer las transacciones. El resto de decoradores son autodefinitorios. */
@Entity('parts')
export class Part {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    example: '40afee0f-dad9-470e-ac2d-44f4e339ac0a',
    description: 'ID único de la parte',
  })
  part_id: string;

  @Column('varchar', { length: 100 })
  @ApiProperty({ example: 'Capítulo 1', description: 'Título de la parte' })
  title: string;

  @Column({ type: 'mediumtext' })
  @ApiProperty({ example: 'Contenido del capítulo...', description: 'Contenido de la parte' })
  content: string;

  @Column({ type: 'int' })
  @ApiProperty({ example: 1200, description: 'Cantidad de palabras' })
  word_count: number;

  @Column('tinyint')
  @ApiProperty({ example: 10, description: 'Tiempo estimado de lectura en minutos' })
  reading_time: number;

  @Column('text')
  @ApiProperty({
    example: 'https://example.com/thumbnails/viaje.jpg',
    description: 'URL de la miniatura',
  })
  thumbnail: string;

  @Column()
  @ApiProperty({ example: false, description: 'Indica si la parte es borrador' })
  is_draft: boolean;

  @Column('timestamp')
  @CreateDateColumn() // decorador genial que me guarda la fecha en la que se creó la entidad en la BBDD
  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Fecha de creación en formato ISO' })
  creation_date: string;

  @Column('timestamp')
  @UpdateDateColumn() // decorador genial que me guarda la fecha en la que se modificó cada vez que se usa el método ".save" del repositorio <3
  @ApiProperty({
    example: '2024-01-02T00:00:00Z',
    description: 'Fecha de última modificación en formato ISO',
  })
  modification_date: string;

  // relación con los partes + breve explicación de sintaxis
  @ManyToOne(
    () => Creation, // primero le asigno la Entidad objetivo
    (creation) => creation.parts, // luego, dentro de esa entidad, por qué propiedad está conectada
  )
  // He tenido que poner este JoinColumn porque en mi base de dato la columna se llama "user_id" y no "userid", que es lo que TypeORM estaba infiriendo y buscando. Como no lo encontraba en la tabla usuarios, petaba.
  @JoinColumn({ name: 'creation_id' })
  @ApiProperty({ description: 'La creación a la que pertenece', type: () => Creation })
  creation: Creation;

  @ManyToOne(() => User, (user) => user.parts)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({
    description:
      'El usuario propietario original de esta parte. Una creación puede estar compuesta de partes originales de otros colaboradores.',
    type: () => User,
  })
  user: User;
}
