import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    public id?: number;
    
    @Column()
    public type_game: string;
  
    @Column({ default: 0 })
    public score_player1: number;
  
    @Column({ default: 0 })
    public score_player2: number;

    @ManyToOne(() => User, (user: User) => user.gamesP1, { eager: true })
    public userPlayer1: User;

    @ManyToOne(() => User, (user: User) => user.gamesP2, { eager: true })
    public userPlayer2: User;
}
