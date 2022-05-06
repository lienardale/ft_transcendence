import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Channel } from '../../channels/entities/channel.entity';

@Entity()
export class MuteList {
    @PrimaryGeneratedColumn()
    public id?: number;
    
    @Column({ type: 'timestamptz' })
    public unmutetime: Date;
  
    @ManyToOne(() => User, (user: User) => user.mute)
    public user: User;

    @ManyToOne(() => Channel, (channel: Channel) => channel.mute, { 
       onDelete: 'CASCADE' 
    })
    public channel: Channel;
}