import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/model/user";
import {
  COOKIE_NAME,
  cookieOptions,
  createToken,
  hashPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    const wantsAdmin = body.role === "ADMIN";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please fill in every field." },
        { status: 400 },
      );
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }
    if (wantsAdmin) {
      const expected = process.env.ADMIN_SIGNUP_CODE;
      if (!expected || String(body.adminCode ?? "") !== expected) {
        return NextResponse.json(
          { error: "That admin code is not correct." },
          { status: 403 },
        );
      }
    }

    await connectDB();
    if (await User.findOne({ email })) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: wantsAdmin ? "ADMIN" : "USER",
    });

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
