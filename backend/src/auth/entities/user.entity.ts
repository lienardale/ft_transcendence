import { FriendsList } from '../../friends-list/entities/friends-list.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Channel } from '../../channels/entities/channel.entity';
import { Message } from '../../messages/entities/message.entity';
import { Game } from '../../games/entities/game.entity';
import { UserStatus } from '../helpers/user.status.enum';
import { BlockedList } from '../../blocked-list/entities/blocked-list.entity';
import { Exclude } from 'class-transformer';
import { MuteList } from '../../mute-list/entities/mute-list.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, default: null })
  login: string;

  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken?: string;

  @Column({default: '/images/default_user.jpg'})
  public avatar_path: string;
  
  @Column({ nullable: true, type: 'bytea' })
  public avatar?: Buffer;

  @Column({default: UserStatus.AWAY})
  public status: UserStatus = UserStatus.AWAY;

  @Column({default: false})
  public banned_user: boolean;

  @Column({default: false})
  public web_admin: boolean;

  @Column({default: '0'})
  public level: string = '0';

  @Column({default: 'false'})
  public level2factor_auth: string = 'false';

  @Column({ nullable: true })
  @Exclude()
  public level2factor_secret?: string;

  @OneToMany(() => Channel, (channel : Channel) => channel.user_owner)
  public channels: Channel[];

  @ManyToMany(() => Channel, (chan : Channel) => chan.members)
  chans: Channel[];

  @ManyToMany(() => Channel, (chanAdmin : Channel) => chanAdmin.members)
  chanAdmins: Channel[];

  @OneToMany(() => Message, (message : Message) => message.user_writer)
  public messages: Message[];

  @OneToMany(() => Game, (game : Game) => game.userPlayer1)
  public gamesP1: Game[];

  @OneToMany(() => Game, (game : Game) => game.userPlayer2)
  public gamesP2: Game[];

  @OneToMany(() => FriendsList, (friend : FriendsList) => friend.user_asking)
  public friendsAsked: FriendsList[];

  @OneToMany(() => FriendsList, (friend : FriendsList) => friend.user_asked)
  public friendsAsking: FriendsList[];

  @OneToMany(() => BlockedList, (block) => block.user_blocking)
  public userBlocked: BlockedList[];      
  
  @OneToMany(() => BlockedList, (block) => block.user_blocked)
  public userBlocking: BlockedList[];

  @OneToMany(() => MuteList, (mute : MuteList) => mute.user)
  public mute: MuteList[];
}