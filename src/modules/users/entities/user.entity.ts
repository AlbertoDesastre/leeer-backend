import { CreationCollaboration } from '@/modules/creations/collaborations/entities/creation-collaboration.entity';
import { Creation } from '@/modules/creations/entities/creation.entity';
import { Part } from '@/modules/creations/parts/entities/part.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

/* @Entity marca la tabla real de la BD "users" para hacer las transacciones. El resto de decoradores son autodefinitorios. */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;
  @Column()
  nickname: string;
  @Column()
  email: string;
  @Column()
  profile_picture: string;
  @Column()
  description: string;
  @Column({ select: false })
  password: string;

  // relación con las creaciones + breve explicación de la sintaxis
  @OneToMany(
    () => Creation, // primero le asigno la Entidad objetivo
    (creation) => creation.user, // luego, dentro de esa entidad, por qué propiedad está conectada
    { cascade: true }, // y finalmente delete on cascade: cuando se elimine este usuario elimina todas sus creaciones
  )
  creations?: Creation[];

  @OneToMany(() => CreationCollaboration, (creationCollaboration) => creationCollaboration.user, {
    cascade: true,
  })
  creation_collaborations?: CreationCollaboration[];

  @OneToMany(
    () => Part, // entidad objetivo
    (part) => part.user, // por qué propiedad está conectada
    {
      cascade: true,
    },
  )
  parts?: Part[];
}
