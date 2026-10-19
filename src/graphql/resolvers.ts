import { connectDB } from "@/lib/mongodb";
import { User } from "@/model/User";
import { Bug } from "@/model/Bug";
import { Comment } from "@/model/Comment";

type Id = string;

export const resolvers = {
  Query: {
    users: async () => {
      await connectDB();
      return User.find().sort({ name: 1 });
    },
    user: async (_: unknown, { id }: { id: Id }) => {
      await connectDB();
      return User.findById(id);
    },
    bugs: async (
      _: unknown,
      args: { status?: string | null; priority?: string | null },
    ) => {
      await connectDB();
      const filter: Record<string, string> = {};
      if (args.status) filter.status = args.status;
      if (args.priority) filter.priority = args.priority;
      return Bug.find(filter).sort({ createdAt: -1 });
    },
    bug: async (_: unknown, { id }: { id: Id }) => {
      await connectDB();
      return Bug.findById(id);
    },
  },

  Mutation: {
    createUser: async (
      _: unknown,
      { input }: { input: { name: string; email: string; role?: string } },
    ) => {
      await connectDB();
      return User.create(input);
    },
    createBug: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          title: string;
          description?: string;
          priority?: string;
          createdBy: Id;
          assignedTo?: Id | null;
        };
      },
    ) => {
      await connectDB();
      return Bug.create(input);
    },
    assignBug: async (
      _: unknown,
      { bugId, userId }: { bugId: Id; userId?: Id | null },
    ) => {
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
    ) => {
      await connectDB();
      return Bug.findByIdAndUpdate(id, { status }, { new: true });
    },
    addComment: async (
      _: unknown,
      { input }: { input: { bugId: Id; userId: Id; text: string } },
    ) => {
      await connectDB();
      return Comment.create(input);
    },
    deleteBug: async (_: unknown, { id }: { id: Id }) => {
      await connectDB();
      await Comment.deleteMany({ bugId: id });
      const res = await Bug.findByIdAndDelete(id);
      return !!res;
    },
    deleteUser: async (_: unknown, { id }: { id: Id }) => {
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

  // These resolve the relationships
  Bug: {
    createdBy: (bug: { createdBy: Id }) => User.findById(bug.createdBy),
    assignedTo: (bug: { assignedTo?: Id | null }) =>
      bug.assignedTo ? User.findById(bug.assignedTo) : null,
    comments: (bug: { id: Id }) =>
      Comment.find({ bugId: bug.id }).sort({ createdAt: 1 }),
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
