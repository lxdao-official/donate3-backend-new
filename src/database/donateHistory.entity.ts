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

  @Column({ type: 'character varying', length: 100 })
  money: string;

  @Column()
  timestamp: number;

  @Column()
  chainId: number;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  erc20: string;
}
