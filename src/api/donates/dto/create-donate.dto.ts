export class CreateDonateDto {
  from: string;
  to: string;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  money: string;
  timestamp: string;
  chainId: number;
  message?: string;
  erc20: string;
  uid?: string;
  amount?: string;
  price?: string;
}
