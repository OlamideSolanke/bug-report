import { GraphQLError } from "graphql";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/model/user";
import { Bug } from "@/model/bug";
import { Comment } from "@/model/comment";

type Id = string;
type SessionUser = { id: string; role: string };
type Context = { currentUser: SessionUser | null };

function requireUser(ctx: Context) {
  if (!ctx.currentUser) {
    throw new GraphQLError("Please log in first.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return ctx.currentUser;
}

function requireAdmin(ctx: Context) {
  const user = requireUser(ctx);
  if (user.role !== "ADMIN") {
    throw new GraphQLError("Only admins can do this.", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return user;
}

export const resolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: Context) => ctx.currentUser,

    users: async (_: unknown, __: unknown, ctx: Context) => {
      requireAdmin(ctx);
      await connectDB();
      return User.find().sort({ name: 1 });
    },

    bugs: async (
      _: unknown,
      args: { status?: string | null; priority?: string | null },
      ctx: Context,
    ) => {
      requireUser(ctx);
      await connectDB();
      const filter: Record<string, string> = {};
      if (args.status) filter.status = args.status;
      if (args.priority) filter.priority = args.priority;
      return Bug.find(filter).sort({ createdAt: -1 });
    },

    bug: async (_: unknown, { id }: { id: Id }, ctx: Context) => {
      requireAdmin(ctx);
      await connectDB();
      return Bug.findById(id);
    },
  },

  Mutation: {
    createBug: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          title: string;
          description?: string;
          priority?: string;
          assignedTo?: Id | null;
        };
      },
      ctx: Context,
    ) => {
      const user = requireUser(ctx);
      await connectDB();
      return Bug.create({
        title: input.title,
        description: input.description,
        priority: input.priority,
        createdBy: user.id,
        // only admins can assign at creation time
        assignedTo: user.role === "ADMIN" ? (input.assignedTo ?? null) : null,
      });
    },

    assignBug: async (
      _: unknown,
      { bugId, userId }: { bugId: Id; userId?: Id | null },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      await connectDB();
      return Bug.findByIdAndUpdate(
        bugId,
        { assignedTo: userId ?? null },
        { new: true },
      );
    },

    updateBugStatus: async (
      _: unknown,
      { id, status }: { id: Id; status: string },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      await connectDB();
      return Bug.findByIdAndUpdate(id, { status }, { new: true });
    },

    addComment: async (
      _: unknown,
      { input }: { input: { bugId: Id; text: string } },
      ctx: Context,
    ) => {
      const admin = requireAdmin(ctx);
      await connectDB();
      return Comment.create({
        bugId: input.bugId,
        userId: admin.id,
        text: input.text,
      });
    },

    deleteBug: async (_: unknown, { id }: { id: Id }, ctx: Context) => {
      requireAdmin(ctx);
      await connectDB();
      await Comment.deleteMany({ bugId: id });
      const res = await Bug.findByIdAndDelete(id);
      return !!res;
    },

    deleteUser: async (_: unknown, { id }: { id: Id }, ctx: Context) => {
      const admin = requireAdmin(ctx);
      if (admin.id === id) {
        throw new GraphQLError("You can't delete your own account.");
      }
      await connectDB();
      const reported = await Bug.find({ createdBy: id }).select("_id");
      const reportedIds = reported.map((b) => b._id);
      await Comment.deleteMany({
        $or: [{ userId: id }, { bugId: { $in: reportedIds } }],
      });
      await Bug.deleteMany({ createdBy: id });
      await Bug.updateMany({ assignedTo: id }, { assignedTo: null });
      const res = await User.findByIdAndDelete(id);
      return !!res;
    },
  },

  Bug: {
    createdBy: (bug: { createdBy: Id }) => User.findById(bug.createdBy),
    assignedTo: (bug: { assignedTo?: Id | null }) =>
      bug.assignedTo ? User.findById(bug.assignedTo) : null,
    comments: (bug: { id: Id }, _args: unknown, ctx: Context) => {
      requireAdmin(ctx);
      return Comment.find({ bugId: bug.id }).sort({ createdAt: 1 });
    },
    createdAt: (bug: { createdAt: Date }) => bug.createdAt.toISOString(),
  },
  User: {
    bugs: (user: { id: Id }) => Bug.find({ createdBy: user.id }),
    assignedBugs: (user: { id: Id }) => Bug.find({ assignedTo: user.id }),
  },
  Comment: {
    user: (c: { userId: Id }) => User.findById(c.userId),
    createdAt: (c: { createdAt: Date }) => c.createdAt.toISOString(),
  },
};
