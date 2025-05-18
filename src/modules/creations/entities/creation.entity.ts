import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
}
