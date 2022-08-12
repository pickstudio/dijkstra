// ./data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: ['dist/entities/*.entity{.ts,.js}'],
    socketPath: '/tmp/mysql.sock',
    synchronize: false,
    logging: true,
    cache: false,
});
