// AirAware AI V2 — Profile-Based Chat Assistant Route Handler
// POST /api/chat

import { NextRequest, NextResponse } from 'next/server';
import { AirSnapshot, ProfileCategory, Language, ChatMessage, ApiResponse } from '@/lib/types';
import { askAirAwareAi } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  const nowIso = new Date().toISOString();

  try {
    const body = await request.json();
    const { message, snapshot, category, language } = body as {
      message?: string;
      snapshot?: AirSnapshot;
      category?: ProfileCategory;
      language?: Language;
    };

    if (!message || message.trim().length === 0) {
      return NextResponse.json<ApiResponse<ChatMessage>>(
        {
          success: false,
          error: 'Question message cannot be empty.',
          fetchedAt: nowIso,
        },
        { status: 400 }
      );
    }

    if (!snapshot || !snapshot.current) {
      return NextResponse.json<ApiResponse<ChatMessage>>(
        {
          success: false,
          error: 'Missing environmental snapshot context.',
          fetchedAt: nowIso,
        },
        { status: 400 }
      );
    }

    const targetCategory: ProfileCategory = category || 'ADULT';
    const targetLang: Language = language || 'en';

    const responseMessage = await askAirAwareAi(
      message.trim(),
      snapshot,
      targetCategory,
      targetLang
    );

    return NextResponse.json<ApiResponse<ChatMessage>>({
      success: true,
      data: responseMessage,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    console.error('[API /api/chat Error]:', error);
    return NextResponse.json<ApiResponse<ChatMessage>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Chat assistant failed.',
        fetchedAt: nowIso,
      },
      { status: 500 }
    );
  }
}
