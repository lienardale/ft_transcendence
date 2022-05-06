import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private MessagesRepository: Repository<Message>
  ) {}

  async create(Message: CreateMessageDto) {
    const newMessage = await this.MessagesRepository.create(Message);
    await this.MessagesRepository.save(newMessage);
    return newMessage;
  }

  findAll() {
    return this.MessagesRepository.find({ relations: ['user_writer','channel_related'] });
  }

  async findOne(id: number) {
    const message = await this.MessagesRepository.findOne(id);
    if (message) {
      return message;
    }
    throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    await this.MessagesRepository.update(id, updateMessageDto);
    const updatedMessage = await this.MessagesRepository.findOne(id);
    if (updatedMessage) {
      return updatedMessage
    }
    throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
  }

  async remove(id: number) {
    const deleteResponse = await this.MessagesRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
    }
  }
}
