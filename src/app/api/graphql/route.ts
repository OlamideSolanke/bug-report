import { createSchema, createYoga } from "graphql-yoga";
import { typeDefs } from "@/graphql/typeDefs";
import { resolvers } from "@/graphql/resolvers";

const { handleRequest } = createYoga<{ params: Promise<unknown> }>({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
  maskedErrors: false,
});
export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
