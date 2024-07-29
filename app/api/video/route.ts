import { useAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { increaseApiLimit,checkApiLimit } from"@/lib/api-limit"; 

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!
});

export async function POST(req:Request) {
  try {
   // const { userId } = useAuth();
    const body = await req.json();
    const { prompt } = body;

    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }
    const input = {
      fps: 24,
      width: 1024,
      height: 576,
      prompt: prompt,
      guidance_scale: 17.5,
     negative_prompt: "very blue, dust, noisy, washed out, ugly, distorted, broken"
  };

  const freeTrail = await checkApiLimit();
  if (!freeTrail) {
    return new NextResponse("Free trial has expired", { status: 403 });
  }
  
  const response = await replicate.run("anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351", { input });
  console.log(response)

  await increaseApiLimit();
  
    return NextResponse.json(response);
  } catch (error) {
    console.log("[VIDEO_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
