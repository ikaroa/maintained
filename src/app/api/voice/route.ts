import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { transcribeAudio, processVoiceQuery, textToSpeech } from "@/lib/voice-ai";
import { logInteraction } from "@/lib/reporting";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id || "unknown";
  const startTime = Date.now();

  try {
    const contentType = request.headers.get("content-type") || "";

    let transcript: string;

    if (contentType.includes("multipart/form-data")) {
      // Audio upload - transcribe with Whisper
      const formData = await request.formData();
      const audioFile = formData.get("audio") as File;
      if (!audioFile) {
        return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
      }
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      transcript = await transcribeAudio(buffer, audioFile.type);
    } else {
      // Text input (for testing or text fallback)
      const body = await request.json();
      transcript = body.text;
      if (!transcript) {
        return NextResponse.json({ error: "No text or audio provided" }, { status: 400 });
      }
    }

    // Process the query through the AI engine
    const result = await processVoiceQuery(transcript);
    const duration = Date.now() - startTime;

    // Log interaction for daily reporting
    await logInteraction({
      userId,
      query: transcript,
      queryType: result.queryType,
      response: result.text,
      duration,
      success: result.success,
      errorMessage: result.errorMessage,
    }).catch(console.error); // Don't fail the request if logging fails

    // Generate TTS audio response
    let audioBase64: string | undefined;
    try {
      const audioBuffer = await textToSpeech(result.text);
      audioBase64 = audioBuffer.toString("base64");
    } catch {
      // TTS failure is non-critical
    }

    return NextResponse.json({
      transcript,
      response: result.text,
      intent: result.intent,
      audio: audioBase64,
      success: result.success,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
