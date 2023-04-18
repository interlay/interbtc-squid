import { ObjectType, Field, Resolver, Query } from 'type-graphql';
import 'reflect-metadata';

@ObjectType()
class CumulativeSupply {
  @Field(() => BigInt)
  totalSupply: bigint;

  @Field(() => BigInt)
  circulatingSupply: bigint;

  @Field(() => BigInt)
  totalVestingTokens: bigint;

  @Field(() => BigInt)
  totalEscrowTokens: bigint;

  constructor() {
    this.totalSupply = 0n;
    this.circulatingSupply = 0n;
    this.totalVestingTokens = 0n;
    this.totalEscrowTokens = 0n;
  }
}

// Create an instance of CumulativeSupply to store and manage the supply data for the API
export let cumulativeSupply = new CumulativeSupply();

// resolver for the cumulative supply query

@Resolver()
export class MyResolver {
  @Query(() => CumulativeSupply)
  async cumulativeSupply(): Promise<CumulativeSupply> {
    return {
      totalSupply: cumulativeSupply.totalSupply,
      circulatingSupply: cumulativeSupply.circulatingSupply,
      totalVestingTokens: cumulativeSupply.totalVestingTokens,
      totalEscrowTokens: cumulativeSupply.totalEscrowTokens,
    };
  }
}