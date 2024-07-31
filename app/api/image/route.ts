import { useAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseApiLimit,checkApiLimit } from"@/lib/api-limit"; 
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
    apiKey: process.env['REACT_APP_OPENAI_API_KEY'], // This is the default and can be omitted
  });

export async function POST(req:Request) {
  try {
   // const { userId } = useAuth();
    const body = await req.json();
    const { prompt,amount=1,resolution="512x512" } = body;

    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      return new NextResponse("OpenAI API Key not configured", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }
    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }
    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    const freeTrail = await checkApiLimit();
    const isPro = await checkSubscription();
    if (!freeTrail&& !isPro) {
      return new NextResponse("Free trial has expired", { status: 403 });
    }

    const response = await openai.images.generate({
        prompt,
        n:parseInt(amount,10),
        size:resolution,
      });
      
      if(!isPro){
      await increaseApiLimit();
      }

    return NextResponse.json(response.data);
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
