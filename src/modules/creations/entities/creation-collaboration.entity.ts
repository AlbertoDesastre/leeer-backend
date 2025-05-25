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
import { Creation } from './creation.entity';

/* @Entity marca la tabla real de la BD "creations" para hacer las transacciones. El resto de decoradores son autodefinitorios. */
@Entity('creation_collaborations')
export class CreationCollaboration {
  @PrimaryGeneratedColumn('uuid')
  creation_collaboration_id: string;
  @Column({ default: null })
  approved_by_original_author: boolean;
  @Column()
  is_fanfiction: boolean;
  @Column()
  is_spin_off: boolean;
  @Column()
  is_canon: boolean;
  @Column('timestamp')
  @CreateDateColumn() // decorador genial que me guarda la fecha en la que se creó la entidad en la BBDD
  creation_date: string;
  @Column('timestamp')
  @UpdateDateColumn() // decorador genial que me guarda la fecha en la que se modificó cada vez que se usa el método ".save" del repositorio <3
  modification_date: string;

  @ManyToOne(
    () => User, // primero le asigno la Entidad objetivo
    (user) => user.creation_collaborations, // luego, dentro de esa entidad, por qué propiedad está conectada
    { eager: true }, // esto carga automáticamente la entidad usuario con la que está relacionado, sin necesidad de hacer un leftJoin
  )
  // He tenido que poner este JoinColumn porque en mi base de datos la columna se llama "user_id" y no "userid", que es lo que TypeORM estaba infiriendo y buscando. Como no lo encontraba en la tabla usuarios, petaba.
  @JoinColumn({ name: 'user_id' })
  user: User;

  /* De nuevo, le digo en qué columna se tiene que fijar para encontrar esta misma entidad */
  @ManyToOne(() => Creation, (creation) => creation.creation_collaborations, { eager: true })
  @JoinColumn({ name: 'creation_id' })
  creation: Creation;
}
