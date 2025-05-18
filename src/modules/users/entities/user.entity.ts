import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  @Column()
  token: string;
  @Column()
  password: string;
}
