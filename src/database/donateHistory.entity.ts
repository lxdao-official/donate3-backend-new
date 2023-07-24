import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DonateHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  blockNumber: number;

  @Column()
  blockHash: string;

  @Column()
  transactionHash: string;

  @Column()
  money: string;

  @Column()
  timestamp: Date;

  @Column()
  chainId: number;
}
