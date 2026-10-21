import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/model/user";
import {
  COOKIE_NAME,
  cookieOptions,
  createToken,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");

    await connectDB();
    const user = await User.findOne({ email }).select("+passwordHash");
    const valid = user
      ? await verifyPassword(password, user.passwordHash)
      : false;
    if (!user || !valid) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, await createToken(user.id), cookieOptions);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          "Something went wrong on the server. Check the terminal for details.",
      },
      { status: 500 },
    );
  }
}
