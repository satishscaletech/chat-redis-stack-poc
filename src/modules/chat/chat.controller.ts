import { Controller, Get, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async storeChats() {
    const data = await this.chatService.storeChat();
    return { data };
  }

  @Get()
  async getChats(@Query() dto: any) {
    const data = await this.chatService.getChats(dto);
    return { data };
  }
}
