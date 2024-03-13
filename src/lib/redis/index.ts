import {
  RedisClientType,
  createClient,
  SchemaFieldTypes,
  RediSearchSchema,
} from 'redis';
import 'dotenv/config';
import { REDIS_INDEX } from '../../constant';
class Redis {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: 'redis://127.0.0.1:6379',
      // url: process.env.REDIS_URL,
      password: 'Admin@123',
    });
    this.init();
  }

  async init() {
    try {
      await this.client.connect();
      this.client.ping().then(async () => {
        console.log('Redis connected!'); // Connected!
        await this.createChatSchema();
      });
    } catch (err) {
      console.log('Redis error =====>', err);
    }
  }

  async createChatSchema() {
    const schema: RediSearchSchema = {
      '$.id': {
        type: SchemaFieldTypes.TEXT,
        SORTABLE: true,
        AS: 'id',
      },
      '$.segments': {
        type: SchemaFieldTypes.NUMERIC,
        SORTABLE: true,
        AS: 'segments',
      },
      '$.body': {
        type: SchemaFieldTypes.TEXT,
        AS: 'body',
      },
      '$.from': {
        type: SchemaFieldTypes.TEXT,
        AS: 'from',
      },
      '$.to': {
        type: SchemaFieldTypes.TAG,
        AS: 'to',
      },
      '$.ts': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'ts',
      },
    };

    console.log(schema);

    try {
      await this.client.ft.create(`idx:${REDIS_INDEX.CREATOR_CHAT}`, schema, {
        ON: 'JSON',
        PREFIX: `${REDIS_INDEX.CREATOR_CHAT}:`,
      });
    } catch (e) {
      if (e.message === 'Index already exists') {
        console.log(
          `Index exists already, skipped creation:${REDIS_INDEX.CREATOR_CHAT} `,
        );
      } else {
        // Something went wrong, perhaps RediSearch isn't installed...
        console.error(e);
        process.exit(1);
      }
    }
  }

  async store(key: string, data: any) {
    console.log('keys', key);

    return await this.client.json.set(key, '$', data);
  }

  async get(idxKey: string, query: string, option: any) {
    // console.log('idxKey', idxKey, 'query', option);

    return await this.client.ft.search(idxKey, query, option);
  }
}

const redis = new Redis();

export default redis;
