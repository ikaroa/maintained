/**
 * Voice AI Engine
 * Handles natural language understanding and response generation.
 * Uses OpenAI GPT for intent extraction and conversational responses.
 */

import OpenAI from "openai";
import { resolveQuery } from "./joblogic";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

interface ParsedIntent {
  intent: string;
  entities: Record<string, string>;
  confidence: number;
}

interface VoiceAIResponse {
  text: string;
  data?: unknown;
  intent: string;
  queryType: string;
  success: boolean;
  errorMessage?: string;
}

const SYSTEM_PROMPT = `You are MAINTAINED AI, a voice assistant for maintenance technicians. You help them access information from their Joblogic field service management system hands-free.

When a user asks a question, you must:
1. Identify the intent and extract entities
2. Respond in a concise, conversational way suitable for text-to-speech

Available intents:
- get_job_status: Retrieve job details. Entities: jobId
- get_invoice: Retrieve invoice details. Entities: invoiceId
- get_estimate: Retrieve estimate/quote details. Entities: estimateId
- get_customer: Retrieve customer info. Entities: customerId, customerName
- list_jobs: List recent jobs. Entities: status (optional)
- list_invoices: List recent invoices
- get_asset: Retrieve asset details. Entities: assetId
- get_engineer: Retrieve engineer details. Entities: engineerId
- general_help: General help or greeting

Respond with JSON only:
{
  "intent": "<intent_name>",
  "entities": { "<key>": "<value>" },
  "confidence": 0.0-1.0
}`;

export async function parseIntent(userQuery: string): Promise<ParsedIntent> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return { intent: "general_help", entities: {}, confidence: 0 };
  }

  return JSON.parse(content) as ParsedIntent;
}

export async function generateResponse(
  userQuery: string,
  data: unknown,
  intent: string
): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are MAINTAINED AI, a voice assistant for maintenance technicians.
Convert the following data into a brief, natural spoken response.
Keep it concise - this will be read aloud via text-to-speech.
If the data contains an error, explain it helpfully.
Do not use markdown, bullet points, or formatting - plain spoken English only.`,
      },
      {
        role: "user",
        content: `User asked: "${userQuery}"\nIntent: ${intent}\nData: ${JSON.stringify(data, null, 2)}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
}

export async function processVoiceQuery(transcript: string): Promise<VoiceAIResponse> {
  const startTime = Date.now();

  try {
    // Step 1: Parse user intent
    const parsed = await parseIntent(transcript);

    // Step 2: Handle general help without API call
    if (parsed.intent === "general_help") {
      return {
        text: "I'm MAINTAINED AI, your maintenance assistant. You can ask me about job statuses, invoices, estimates, customers, or assets. Just say something like 'What's the status of job 12345?' or 'How much is invoice 67890?'",
        intent: parsed.intent,
        queryType: "help",
        success: true,
      };
    }

    // Step 3: Resolve the query against Joblogic API
    let data: unknown;
    try {
      data = await resolveQuery(parsed.intent, parsed.entities);
    } catch (apiError) {
      const message =
        apiError instanceof Error ? apiError.message : "Unknown API error";
      return {
        text: "I'm having trouble connecting to the Joblogic system right now. Please try again in a moment.",
        intent: parsed.intent,
        queryType: parsed.intent,
        success: false,
        errorMessage: message,
      };
    }

    // Step 4: Generate conversational response
    const responseText = await generateResponse(transcript, data, parsed.intent);

    return {
      text: responseText,
      data,
      intent: parsed.intent,
      queryType: parsed.intent,
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      text: "Sorry, I encountered an error processing your request. Please try again.",
      intent: "error",
      queryType: "error",
      success: false,
      errorMessage: message,
    };
  }
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(audioBuffer: Buffer, mimeType: string = "audio/webm"): Promise<string> {
  const ext = mimeType.includes("wav") ? "wav" : mimeType.includes("mp4") ? "mp4" : "webm";
  const uint8 = new Uint8Array(audioBuffer);
  const file = new File([uint8], `audio.${ext}`, { type: mimeType });

  const transcription = await getOpenAI().audio.transcriptions.create({
    model: "whisper-1",
    file,
    language: "en",
  });

  return transcription.text;
}

/**
 * Generate speech from text using OpenAI TTS
 */
export async function textToSpeech(text: string): Promise<Buffer> {
  const response = await getOpenAI().audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
    response_format: "mp3",
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
