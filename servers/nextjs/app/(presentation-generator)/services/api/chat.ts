/**
 * Presentation chat — backed by the presentation-chat edge function (Gemini).
 * Conversation history is not persisted in V1, so list/history return empty.
 * Streaming is simulated on top of the single-shot edge call so the existing
 * Chat UI (which uses streamMessage) keeps working unchanged.
 */
import { callEdgeFunction } from "@/lib/supabase";

export interface ChatMessageRequest {
  presentation_id: string;
  message: string;
  conversation_id?: string;
}

export interface ChatMessageResponse {
  conversation_id?: string;
  response: string;
  tool_calls?: string[];
}

export interface ChatHistoryMessage {
  role: string;
  content: string;
  created_at?: string;
}

export interface ChatHistoryData {
  presentation_id: string;
  conversation_id: string;
  messages: ChatHistoryMessage[];
}

export interface ChatConversationSummary {
  conversation_id: string;
  updated_at?: string | null;
  last_message_preview?: string | null;
}

export interface ChatStreamTrace {
  kind?: string;
  round?: number;
  tool?: string;
  status?: string;
  message?: string;
  tools?: string[];
  slideIndex?: number;
  slideNumber?: number;
  targetSlideIndices?: number[];
  targetSlideNumbers?: number[];
}

export interface ChatStreamHandlers {
  onChunk?: (chunk: string) => void;
  onStatus?: (status: string) => void;
  onTrace?: (trace: ChatStreamTrace) => void;
  onComplete?: (response: ChatMessageResponse) => void;
}

export class PresentationChatApi {
  static async listConversations(
    _presentationId: string
  ): Promise<ChatConversationSummary[]> {
    return [];
  }

  static async getHistory(
    presentationId: string,
    conversationId: string
  ): Promise<ChatHistoryData> {
    return {
      presentation_id: presentationId,
      conversation_id: conversationId,
      messages: [],
    };
  }

  static async sendMessage(
    payload: ChatMessageRequest
  ): Promise<ChatMessageResponse> {
    return callEdgeFunction<ChatMessageResponse>("presentation-chat", {
      body: {
        presentationId: payload.presentation_id,
        message: payload.message,
      },
    });
  }

  static async streamMessage(
    payload: ChatMessageRequest,
    handlers: ChatStreamHandlers = {},
    _options?: { signal?: AbortSignal }
  ): Promise<ChatMessageResponse> {
    handlers.onStatus?.("Denke nach…");
    const result = await PresentationChatApi.sendMessage(payload);
    if (result.response) {
      handlers.onChunk?.(result.response);
    }
    handlers.onComplete?.(result);
    return result;
  }
}
