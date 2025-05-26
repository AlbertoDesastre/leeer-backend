import { Creation } from '@/modules/creations/entities/creation.entity';
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

/* @Entity marca la tabla real de la BD "creations" para hacer las transacciones. El resto de decoradores son autodefinitorios. */
@Entity('parts')
export class Part {
  @PrimaryGeneratedColumn('uuid')
  part_id: string;
  @Column({ type: 'mediumtext' })
  content: string;
  @Column({ type: 'int' })
  word_count: number;
  @Column('tinyint')
  reading_time: number;
  @Column('text')
  thumbnail: string;
  @Column()
  is_draft: boolean;
  @Column('timestamp')
  @CreateDateColumn() // decorador genial que me guarda la fecha en la que se creó la entidad en la BBDD
  creation_date: string;
  @Column('timestamp')
  @UpdateDateColumn() // decorador genial que me guarda la fecha en la que se modificó cada vez que se usa el método ".save" del repositorio <3
  modification_date: string;

  // relación con los partes + breve explicación de sintaxis
  @ManyToOne(
    () => Creation, // primero le asigno la Entidad objetivo
    (creation) => creation.parts, // luego, dentro de esa entidad, por qué propiedad está conectada
  )
  // He tenido que poner este JoinColumn porque en mi base de dato la columna se llama "user_id" y no "userid", que es lo que TypeORM estaba infiriendo y buscando. Como no lo encontraba en la tabla usuarios, petaba.
  @JoinColumn({ name: 'creation_id' })
  creation: Creation;

  @ManyToOne(() => User, (user) => user.parts)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
