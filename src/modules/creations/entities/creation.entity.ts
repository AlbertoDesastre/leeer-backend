import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '@/modules/users/entities/user.entity';
import { Part } from '@/modules/creations/parts/entities/part.entity';
import { CreationCollaboration } from '../collaborations/entities/creation-collaboration.entity';
import { ApiProperty } from '@nestjs/swagger';

/* @Entity marca la tabla real de la BD "creations" para hacer las transacciones. El resto de decoradores son autodefinitorios. */
@Entity('creations')
export class Creation {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    example: '40afee0f-dad9-470e-ac2d-44f4e339ac0a',
    description: 'ID de la Creación',
    uniqueItems: true,
  })
  creation_id: string;
  @Column({ type: 'varchar', length: 60 })
  @ApiProperty({
    example: 'Viaje al Centro de la Tierra',
    description: 'Título de la creación',
  })
  title: string;
  @Column()
  @ApiProperty({
    example: true,
    description: '¿Es un borrador (true) o es una obra publicada (false)?',
  })
  is_draft: boolean;
  @Column('tinytext')
  @Column()
  @ApiProperty({
    example: 'Una expedición increíble hacia las profundidades del planeta.',
    description: 'Sinopsis de la creación',
  })
  synopsis: string;
  @Column('text')
  @ApiProperty({
    example:
      'Inspirado en la obra de Julio Verne, este relato acompaña a un grupo de aventureros que descubre maravillas ocultas bajo la superficie terrestre.',
    description: 'Descripción de la creación',
  })
  description: string;
  @Column('text')
  @ApiProperty({
    example: 'https://example.com/thumbnails/viaje.jpg',
    description: 'Foto principal de la creación',
  })
  thumbnail: string;
  @Column('timestamp')
  @CreateDateColumn() // decorador genial que me guarda la fecha en la que se creó la entidad en la BBDD
  @ApiProperty({
    example: '2025-07-30T11:33:37.000Z',
    description: 'Cuándo se creó. Fecha en formato ISO',
  })
  creation_date: string;
  @Column('timestamp')
  @UpdateDateColumn() // decorador genial que me guarda la fecha en la que se modificó cada vez que se usa el método ".save" del repositorio <3
  @ApiProperty({
    example: '2025-07-30T11:33:37.000Z',
    description: 'Cuándo se modificó por última vez. Fecha en formato ISO',
  })
  modification_date: string;

  // relación con los usuarios + breve explicación de sintaxis
  @ApiProperty({ description: 'Usuario autor de la creación', type: () => User })
  @ManyToOne(
    () => User, // primero le asigno la Entidad objetivo
    (user) => user.creations, // luego, dentro de esa entidad, por qué propiedad está conectada
    { eager: true }, // esto carga automáticamente la entidad usuario con la que está relacionado, sin necesidad de hacer un leftJoin
  )
  // He tenido que poner este JoinColumn porque en mi base de dato la columna se llama "user_id" y no "userid", que es lo que TypeORM estaba infiriendo y buscando. Como no lo encontraba en la tabla usuarios, petaba.
  @JoinColumn({ name: 'user_id' })
  @ApiProperty()
  user: User;

  @OneToMany(() => CreationCollaboration, (creationCollaboration) => creationCollaboration.creation)
  @JoinColumn({ name: 'creation_collaboration_id' })
  @ApiProperty()
  creation_collaborations?: CreationCollaboration[];

  @OneToMany(() => Part, (part) => part.creation)
  @JoinColumn({ name: 'part_id' })
  @ApiProperty()
  parts?: Part[];
}
