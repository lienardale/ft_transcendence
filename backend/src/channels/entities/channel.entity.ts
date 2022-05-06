import { Column, Entity,  ManyToOne, OneToMany, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Message } from '../../messages/entities/message.entity';
import { MuteList } from '../../mute-list/entities/mute-list.entity';
import { EncryptionTransformer } from "typeorm-encrypted";

@Entity()
export class Channel {
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
  
    @Column({
        type: "varchar",
        nullable: true,
        transformer: new EncryptionTransformer({
          key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
          algorithm: 'aes-256-cbc',
          ivLength: 16,
          iv: 'ff5ac19190424b1d88f9419ef949ae56'
        })
      })
    public password: string;

    @ManyToOne(() => User, (user: User) => user.channels)
    public user_owner: User;

    @OneToMany(() => Message, (message : Message) => message.channel_related)
    public messages: Message[];

    @OneToMany(() => MuteList, (mute : MuteList) => mute.channel)
    public mute: MuteList[];

    @ManyToMany(() => User, (admin : User) => admin.chans)
    @JoinTable()
    admins: User[];

    @ManyToMany(() => User, (member : User) => member.chans)
    @JoinTable()
    members: User[];
  
    @ManyToMany(() => User, (banned_member : User) => banned_member.chans)
    @JoinTable()
    banned: User[];
}