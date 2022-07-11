import { CreateDateColumn } from 'typeorm';

export class CreateAt {
  @CreateDateColumn()
  createAt: Date;
}
