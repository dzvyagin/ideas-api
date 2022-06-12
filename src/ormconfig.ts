import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const { DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = process.env;

const TYPE_ORM_MODULE_OPTIONS: TypeOrmModuleOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: true,
  entities: ['dist/**/*.entity{.ts,.js}'],
  subscribers: [],
  migrations: [],
};

export default TYPE_ORM_MODULE_OPTIONS;
