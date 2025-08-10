import { ApiProperty } from '@nestjs/swagger';

import { User } from '@/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Creation } from '../../entities/creation.entity';

/* @Entity marca la tabla real de la BD "creations" para hacer las transacciones. El resto de decoradores son autodefinitorios. */
@Entity('creation_collaborations')
export class CreationCollaboration {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    example: '40afee0f-dad9-470e-ac2d-44f4e339ac0a',
    description: 'ID único de la colaboración',
    uniqueItems: true,
  })
  creation_collaboration_id: string;

  @Column({ default: null })
  @ApiProperty({
    example: true,
    description: 'Aprobado por el autor original',
    default: null,
  })
  approved_by_original_author: boolean | null;

  @Column()
  @ApiProperty({ example: false, description: '¿Es fanfiction?' })
  is_fanfiction: boolean;

  @Column()
  @ApiProperty({ example: true, description: '¿Es spin-off?' })
  is_spin_off: boolean;

  @Column()
  @ApiProperty({ example: true, description: '¿Es canon?' })
  is_canon: boolean;

  @Column('timestamp')
  @CreateDateColumn() // decorador genial que me guarda la fecha en la que se creó la entidad en la BBDD
  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Fecha de creación en formato ISO',
  })
  creation_date: string;

  @Column('timestamp')
  @UpdateDateColumn() // decorador genial que me guarda la fecha en la que se modificó cada vez que se usa el método ".save" del repositorio <3
  @ApiProperty({
    example: '2024-01-02T00:00:00Z',
    description: 'Fecha de última modificación en formato ISO',
  })
  modification_date: string;

  @ManyToOne(
    () => User, // primero le asigno la Entidad objetivo
    (user) => user.creation_collaborations, // luego, dentro de esa entidad, por qué propiedad está conectada
    { eager: true }, // esto carga automáticamente la entidad usuario con la que está relacionado, sin necesidad de hacer un leftJoin
  )
  // He tenido que poner este JoinColumn porque en mi base de datos la columna se llama "user_id" y no "userid", que es lo que TypeORM estaba infiriendo y buscando. Como no lo encontraba en la tabla usuarios, petaba.
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Usuario colaborador', type: () => User })
  user: User;

  /* De nuevo, le digo en qué columna se tiene que fijar para encontrar esta misma entidad */
  @ManyToOne(() => Creation, (creation) => creation.creation_collaborations, { eager: true })
  @JoinColumn({ name: 'creation_id' })
  @ApiProperty({ description: 'Creación asociada', type: () => Creation })
  creation: Creation;
}
