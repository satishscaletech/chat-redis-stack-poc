import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { REDIS_INDEX } from 'src/constant';
import { getPaginateOffset } from 'src/helper';
import redis from 'src/lib/redis';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import * as otpGenerator from 'otp-generator';

@Injectable()
export class ChatService {
  public async storeChat() {
    // const res = await redis.store(`${REDIS_INDEX.CREATOR_CHAT}:5010652620`, {
    //   body: 'STOP',
    //   from: '+491607879739',
    //   id: '5010652620',
    //   segments: 1,
    //   to: '+4915735989131',
    //   ts: new Date('2023-04-26T17:55:46.000Z').getTime(),
    // });
    // console.info('Redis news response: ', res);

    const readStream = await fs
      .createReadStream('src/data/chat.json', 'utf-8')
      .pipe(StreamArray.withParser());

    readStream.on('data', async (chunk) => {
      //   console.log('chunk=============>', chunk.value.notifications.items);
      const chatData = chunk.value.notifications.items;

      for (const key in chatData) {
        console.log(
          'chat.................',
          chunk.value.notifications.items[key],
        );
        const digit = otpGenerator.generate(4, {
          upperCaseAlphabets: false,
          specialChars: false,
        });

        const chat = chunk.value.notifications.items[key];
        chat.id = `${chat.id}${digit}`;
        chat.ts = new Date(chat.ts).getTime();

        const res = await redis.store(
          `${REDIS_INDEX.CREATOR_CHAT}:${chat.id}`,
          chat,
        );
        console.info('Redis news response: ', res);
      }
    });

    readStream.on('end', function () {
      console.log('finished reading chats');
    });
  }

  public async getChats(dto: any) {
    console.log(dto);
    const { limit, offset } = getPaginateOffset(dto.page, dto.recordPerPage);
    let option: any = {
      LIMIT: {
        from: offset,
        size: limit,
      },
    };

    if (dto.sort && dto.sortType) {
      option['SORTBY'] = {
        BY: dto.sort,
        DIRECTION: dto.sortType,
      };
    }

    const chatRes = await this.getChatByQuery(`(@body: ${dto.search})`, option);
    return chatRes;
  }

  public async getChatByQuery(query: any, option: any) {
    console.log('query', query, 'option', option);

    const catRes = await redis.get(
      'idx:' + REDIS_INDEX.CREATOR_CHAT,
      query,
      option,
    );
    return catRes.documents.map((doc) => {
      return doc.value;
    });
  }
}
