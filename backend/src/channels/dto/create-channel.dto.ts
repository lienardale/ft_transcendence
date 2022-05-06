export class CreateChannelDto {
    channel_type: string;
    name: string;
    id_pm: number;
    hasPassword: boolean;
    password: string;
}