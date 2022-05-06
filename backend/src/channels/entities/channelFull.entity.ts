import { Column, Entity,  ManyToOne, OneToMany, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Message } from '../../messages/entities/message.entity';
import { MuteList } from '../../mute-list/entities/mute-list.entity';
import { EncryptionTransformer } from "typeorm-encrypted";

@Entity()
export class ChannelFull {
    @PrimaryGeneratedColumn()
    public id?: number;
  
    @Column()
    public channel_type: string;
  
    @Column()
    public name: string;

    @Column()
    public id_pm: number;
    
    @Column()
    public hasPassword: boolean;
  
    @ManyToOne(() => User, (user: User) => user.channels)
    public userOwnerId: User;
    
    @Column()
    public iAmMember: number;

    @Column()
    public iAmBanned: number;

    @Column()
    public iBlock: number;
}