import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelDto } from './create-channel.dto';
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
    @IsString()
    @IsOptional()
    channel_type?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    id_pm?: number;
    
    @IsBoolean()
    @IsOptional()
    public hasPassword: boolean;

    @IsString()
    @IsOptional()
    password?: string;
}
