import { DataSource, DataSourceOptions } from 'typeorm';

try {
  process.loadEnvFile();
} catch {}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [`${__dirname}/../**/*.entity.js`],
  migrations: [`${__dirname}/migrations/*.js`],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
