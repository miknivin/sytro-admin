import { NextResponse } from "next/server";

export async function POST(req) {
  const response = NextResponse.json(
    { message: "Logged Out" },
    { status: 200 }
  );

  response.cookies.set("token", "", {
    expires: new Date(Date.now()), // Expire immediately
    httpOnly: true,
  });

  return response;
}
