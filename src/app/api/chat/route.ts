// AirAware AI V2 — Profile-Based Chat Assistant Route Handler
// POST /api/chat

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, ChatMessage } from '@/lib/types';
import { askAirAwareAi } from '@/lib/ai/gemini';
import {
  assertValidSnapshot,
  handleRouteError,
  parseChatQuestion,
  parseJsonBody,
  parseLanguage,
  parseProfileCategory,
} from '@/lib/api/validation';

interface ChatRequestBody {
  message?: unknown;
  snapshot?: unknown;
  category?: unknown;
  profileCategory?: unknown;
  language?: unknown;
}

export async function POST(request: NextRequest) {
  const nowIso = new Date().toISOString();

  try {
    const body = await parseJsonBody<ChatRequestBody>(request);
    const cleanQuestion = parseChatQuestion(body.message);
    assertValidSnapshot(body.snapshot);

    const targetCategory = parseProfileCategory(body.category ?? body.profileCategory, 'ADULT');
    const targetLang = parseLanguage(body.language, 'en');

    const responseMessage = await askAirAwareAi(
      cleanQuestion,
      body.snapshot,
      targetCategory,
      targetLang
    );

    return NextResponse.json<ApiResponse<ChatMessage>>({
      success: true,
      data: responseMessage,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    return handleRouteError<ChatMessage>(
      '/api/chat',
      error,
      'Unable to process question right now.'
    );
  }
}
