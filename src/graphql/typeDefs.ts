export const typeDefs = `#graphql
  enum Role { ADMIN DEVELOPER }
  enum Priority { LOW MEDIUM HIGH }
  enum Status { OPEN IN_PROGRESS RESOLVED }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    bugs: [Bug!]!
    assignedBugs: [Bug!]!
  }

  type Bug {
    id: ID!
    title: String!
    description: String
    priority: Priority!
    status: Status!
    createdBy: User!
    assignedTo: User
    comments: [Comment!]!
    createdAt: String!
  }

  type Comment {
    id: ID!
    text: String!
    bugId: ID!
    user: User!
    createdAt: String!
  }

  input CreateUserInput { name: String!, email: String!, role: Role }
  input CreateBugInput {
    title: String!
    description: String
    priority: Priority
    createdBy: ID!
    assignedTo: ID
  }
  input AddCommentInput { bugId: ID!, userId: ID!, text: String! }

  type Query {
    users: [User!]!
    user(id: ID!): User
    bugs(status: Status, priority: Priority): [Bug!]!
    bug(id: ID!): Bug
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createBug(input: CreateBugInput!): Bug!
    assignBug(bugId: ID!, userId: ID): Bug
    updateBugStatus(id: ID!, status: Status!): Bug
    addComment(input: AddCommentInput!): Comment!
    deleteBug(id: ID!): Boolean!
    deleteUser(id: ID!): Boolean!
  }
`;
