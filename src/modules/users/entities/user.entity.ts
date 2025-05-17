import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;
  @Column()
  nickname: string;
  @Column()
  email: string;
  @Column()
  profile_picture: boolean;
  @Column()
  description: string;
  @Column()
  token: string;
  @Column()
  password: boolean;
}
