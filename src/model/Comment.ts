import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    bugId: {
      type: Schema.Types.ObjectId,
      ref: "Bug",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Comment =
  mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
