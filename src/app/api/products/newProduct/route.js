import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Product from '@/models/Products';
import { authorizeRoles, isAuthenticatedUser } from '@/middlewares/auth';


export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    
    const user = await isAuthenticatedUser(req)
    console.log(user);
    
    if (user) {
        console.log(user.role);
        
        authorizeRoles(user,'admin')
    }
    
    const images = body.images.map((url) => ({ url }));
    body.images = images;
    body.user = user;

    const product = await Product.create(body);

    return NextResponse.json({
      success: true,
      product,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
