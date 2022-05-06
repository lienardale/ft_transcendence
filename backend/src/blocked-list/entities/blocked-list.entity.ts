import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class BlockedList {
    @PrimaryGeneratedColumn()
    public id?: number;
  
    @ManyToOne(() => User, (user: User) => user.userBlocking)
    public user_blocking: User;

    @ManyToOne(() => User, (user: User) => user.userBlocked)
    public user_blocked: User;
}
