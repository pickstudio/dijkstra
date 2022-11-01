import { PrimaryGeneratedColumn } from 'typeorm';

import { TimeColumns } from './time-columns';

export class CommonColumns extends TimeColumns {
    @PrimaryGeneratedColumn()
    id: number;
}
