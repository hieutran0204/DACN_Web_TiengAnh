
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      examId,
      task1Question,
      task1Type,
      task1Answer,
      task2Question,
      task2Type,
      task2Answer,
    } = body;
    
    const API_KEY = process.env.SERVICE_API_KEY || "your-secret-app-key-123";

    // Prepare batch payload
    const batchPayload = {
      task1: { 
        essay: task1Answer, 
        question: task1Question, 
        type: task1Type || "Task 1" 
      },
      task2: { 
        essay: task2Answer, 
        question: task2Question, 
        type: task2Type || "Task 2" 
      }
    };

    console.log("Submitting batch writing exam...", JSON.stringify(batchPayload).substring(0, 200));

    // Call unified endpoint
    const res = await fetch("http://localhost:5000/api/ai/score/writing/exam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(batchPayload),
      signal: AbortSignal.timeout(6000000), // 100 minutes timeout for local inference
    });

    const contentType = res.headers.get("content-type");
    const responseText = await res.text();

    console.log(`Microservice Response: Status=${res.status}, Type=${contentType}`);
    console.log("Response Body Preview:", responseText.substring(0, 500));

    let result;
    try {
        result = JSON.parse(responseText);
    } catch (e) {
        console.error("Failed to parse microservice response as JSON:", e);
        return NextResponse.json(
            { success: false, message: `Microservice Error (${res.status}): ${responseText.substring(0, 200)}` },
            { status: res.status || 500 }
        );
    }
    
    // Result format from microservice: { success: true, data: { task1: {...}, task2: {...} } }

    if (!result.success) {
      console.error("Microservice Error:", result);
      return NextResponse.json(
        { success: false, message: result.error || "AI Service Error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: "exam-sub-" + Date.now(), 
      data: result.data // { task1: ..., task2: ... }
    });

  } catch (error: any) {
    console.error("Example Proxy Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
