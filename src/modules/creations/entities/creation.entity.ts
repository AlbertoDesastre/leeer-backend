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
import { Part } from '@/modules/parts/entities/part.entity';
import { CreationCollaboration } from './creation-collaboration.entity';
/* @Entity marca la tabla real de la BD "creations" para hacer las transacciones. El resto de decoradores son autodefinitorios. */
@Entity('creations')
export class Creation {
  @PrimaryGeneratedColumn('uuid')
  creation_id: string;
  @Column({ type: 'varchar', length: 60 })
  title: string;
  @Column()
  is_draft: boolean;
  @Column('tinytext')
  synopsis: string;
  @Column('text')
  description: string;
  @Column('text')
  thumbnail: string;
  @Column('timestamp')
  @CreateDateColumn() // decorador genial que me guarda la fecha en la que se creó la entidad en la BBDD
  creation_date: string;
  @Column('timestamp')
  @UpdateDateColumn() // decorador genial que me guarda la fecha en la que se modificó cada vez que se usa el método ".save" del repositorio <3
  modification_date: string;

  // relación con los usuarios + breve explicación de sintaxis
  @ManyToOne(
    () => User, // primero le asigno la Entidad objetivo
    (user) => user.creations, // luego, dentro de esa entidad, por qué propiedad está conectada
    { eager: true }, // esto carga automáticamente la entidad usuario con la que está relacionado, sin necesidad de hacer un leftJoin
  )
  // He tenido que poner este JoinColumn porque en mi base de dato la columna se llama "user_id" y no "userid", que es lo que TypeORM estaba infiriendo y buscando. Como no lo encontraba en la tabla usuarios, petaba.
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => CreationCollaboration, (creationCollaboration) => creationCollaboration.creation)
  @JoinColumn({ name: 'creation_collaboration_id' })
  creation_collaborations?: CreationCollaboration[];

  @OneToMany(() => Part, (part) => part.creation)
  @JoinColumn({ name: 'part_id' })
  parts?: Part[];
}
