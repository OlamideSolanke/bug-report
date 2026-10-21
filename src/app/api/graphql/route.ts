import { createSchema, createYoga } from "graphql-yoga";
import { typeDefs } from "@/graphql/typeDefs";
import { resolvers } from "@/graphql/resolvers";
import { getSessionUser } from "@/lib/auth";

const { handleRequest } = createYoga<{ params: Promise<unknown> }>({
 schema: createSchema({ typeDefs, resolvers }) as never,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
  maskedErrors: process.env.NODE_ENV === "production",
  context: async ({ request }) => ({
    currentUser: await getSessionUser(request),
  }),
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
