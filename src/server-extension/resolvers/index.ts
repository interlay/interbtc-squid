// import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql'
// import type { EntityManager } from 'typeorm'

// // Define custom GraphQL ObjectType of the query result
// @ObjectType()
// export class MyQueryResult {
//   @Field(() => Number, { nullable: false })
//   total!: number

//   @Field(() => Number, { nullable: false })
//   max!: number

// //   constructor(props: Partial<MyQueryResult>) {
// //     Object.assign(this, props);
// //   }
//     constructor(props: number) {
//         this.total = props;
//         this.max = props * 2;
//     }
// }


// @Resolver()
// export class MyResolver {
//   // Set by depenency injection
//   constructor(private tx: () => Promise<EntityManager>) {}

//   @Query(() => MyQueryResult)
//   async myQuery(): Promise<MyQueryResult> {
//     return new MyQueryResult(42);
//   }
// }