import { ObjectType, Field, Resolver, Query } from 'type-graphql';
import 'reflect-metadata';
import { env } from 'process';

// Define a CumulativeSupply class to represent supply data in our GraphQL schema
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
    if (env.SS58_CODEC === 'interlay') {
      this.totalSupply = BigInt(1_000_000_000) * BigInt(10)**BigInt(10);
    }
    else { // Kusama 
      this.totalSupply = BigInt(10_000_000) * BigInt(10)**BigInt(12);
    }
    this.circulatingSupply = 0n;
    this.totalVestingTokens = 0n;
    this.totalEscrowTokens = 0n;
  }
}

// Create a singleton instance of CumulativeSupply
// This instance will be used to manage the state of our supply data
export let cumulativeSupply = new CumulativeSupply();

// Define a Resolver for our CumulativeSupply type
@Resolver()
export class MyResolver {
  // The `cumulativeSupply` query returns the current state of our supply data
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

let totalLocked = 0n;
let totalReserved = 0n;

export function updateCirculatingSupply(updateAmount: bigint, updateType: string): void {
  // circulatingSupply = totalSupply - totalLocked - totalReserved - systemAccountSupply
  if (updateType == "locked") {
    totalLocked += updateAmount;
  }
  else if (updateType == "reserved") {
    totalReserved += updateAmount;
  }

  // query system account balance
  const currentSystemAccountSupply = 0n;

  cumulativeSupply.circulatingSupply = cumulativeSupply.totalSupply - totalLocked - totalReserved - currentSystemAccountSupply;
}