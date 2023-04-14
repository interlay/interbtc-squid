import { Query, Resolver } from 'type-graphql'

class CumulativeSupply {
    totalSupply: bigint;
    circulatingSupply: bigint;
    totalVestingTokens: bigint;
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
      totalEscrowTokens: cumulativeSupply.totalEscrowTokens
    }
  }
}
