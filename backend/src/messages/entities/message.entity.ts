import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Channel } from '../../channels/entities/channel.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    public id?: number;
  
    @Column()
    public content: string;

    @Column({ type: 'timestamptz' })
    public datetime: Date;

    @ManyToOne(() => User, (user: User) => user.messages)
    public user_writer: User;

    @ManyToOne(() => Channel, (channel: Channel) => channel.messages, {
        onDelete: "CASCADE"
    })
    public channel_related: Channel;
}
