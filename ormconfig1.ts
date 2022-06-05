import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'danilazvagin',
  password: '',
  database: 'ideas',
  synchronize: true,
  logging: true,
  entities: ['dist/**/*.entity{.ts,.js}'],
  subscribers: [],
  migrations: [],
});
