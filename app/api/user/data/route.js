import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


//This defines a GET request handler for a Next.js API route (this is Next.js 13+ App Router syntax).
export async function GET(request) {
  
  try {
    
    const { userId } = getAuth(request); // extracts the user ID from Clerk session.
    console.log("userId from Clerk:", userId); // debug log

    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(userId);
    console.log("Fetched user from DB:", user); // 🔍 debug log

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error in GET /api/user/data:", error); // 🔥 catch errors
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
