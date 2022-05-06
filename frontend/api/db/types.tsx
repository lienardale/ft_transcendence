export interface UserType {
  status: string;
  level: string;
  level2factor_auth: string;
  id: number;
  email: string;
  login: string;
  avatar_path: string;
  avatar: string;
  channels: ChannelType[] | null;
  messages: MessageType[] | null;
  friends: FriendItem[] | null | undefined;
  asking: AskList[] | null | undefined;
  asked: AskList[] | null | undefined;
  blocking: BlockList[];
  blocked_by: BlockList[] | null;
  games: Game[] | null;
  web_admin: boolean;
  banned_user: boolean;
}

export interface UserFull {
  id: number;
  status: string;
  level: string;
  level2factor_auth: string;
  email: string;
  login: string;
  avatar_path: string;
  avatar: string;
  web_admin: boolean;
  banned_user: boolean;
  isBlockedByMe: number;
}


export interface MessageType {
  id: number;
  content: string;
  datetime: string;
  user_writer: UserType;
};

export interface ChannelType {
  id: number;
  channel_type: string;
  name: string;
  id_pm: number;
  hasPassword: boolean,
  password: string;
  user_owner: UserType;
  messages: MessageType[];
  banned: UserType[];
};

export interface ChannelFull {
  id: number;
  channel_type: string;
  name: string;
  id_pm: number;
  hasPassword: boolean;
  userOwnerId: number;
  iAmMember: number;
  iAmBanned: number;
  iBlock: number;
};

export interface ChannelSelected {
  id: number;
  channel_type: string;
  name: string;
  id_pm: number;
  hasPassword: boolean;
  user_owner: UserType;
  members: UserType[];
  admins: UserType[];
  banned: UserType[];
  messages: MessageType[];
  mute: MuteList[];
};

export interface myChannelType {
  id: number;
  channel_type: string;
  name: string;
  id_pm: number;
  hasPassword: boolean;
  password: string;
  user_owner: UserType;
  members: UserType[];
  banned: UserType[];
  messages: MessageType[];
};

export interface UserContext {
  value?: UserType | undefined;
  setCurrentUser: (value: UserType) => void;
};

export interface Game {
  id: number;
  type_game: string;
  score_player1: number;
  score_player2: number;
  userPlayer1: UserType;
  userPlayer2: UserType;
}

export interface AskList {
  id:number;
  friendship_status: string;
  user_asking: UserType;
  user_asked: UserType;
}

export interface BlockList {
  id:number;
  user_blocking:UserType;
  user_blocked:UserType;
}

export interface MuteList {
  id:number;
  unmutetime: Date;
  user:UserType;
  channel:ChannelType;
}

export interface FriendItem {
  friendslist_id: number;
  friend_id: number;
  friend_email: string
  friend_login: string;
  friend_avatar_path: string;
  friend_status: string;
  friend_level: string;
}

export interface Window {
  cloudinary : any;
}
