import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class FriendsList {
    @PrimaryGeneratedColumn()
    public id?: number;
    
    @Column()
    public friendship_status: string;
  
    @ManyToOne(() => User, (user: User) => user.friendsAsking)
    public user_asking: User;

    @ManyToOne(() => User, (user: User) => user.friendsAsked)
    public user_asked: User;
}