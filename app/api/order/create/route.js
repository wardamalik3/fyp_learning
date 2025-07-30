import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/config/db";
import { inngest } from '@/config/inngest';
import User from "@/models/User";
export async function POST(request) {
  await connectDB();

  try {
    const { userId } = getAuth(request);
    const { address, items } = await request.json();

    if (!address || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid data" });
    }

    // Calculate amount using items
    const amount = await items.reduce(async (acc,item) =>
    {
      const product = await Product.findById(item.product);
      return await acc + product.offerPrice * item.quantity;
    },0);

    // Save order by sending event to inngest
    await inngest.send({
      name: 'order/created',
      data: 
      {
        userId,
        address,
         items,
         amount: amount + Math.floor(amount * 0.02),
         date: Date.now()
      }
      });

      // CLEARINGG USER CART DATA
      const user=await User.findById(userId)
      user.cartItems={}
      await user.save()
      return NextResponse.json({success:true,message:"Order Placed"})
    
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
