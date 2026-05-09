import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../config/database';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const chatbotService = {
  async list(workspaceId: string) {
    return prisma.chatbot.findMany({
      where: { workspaceId },
      include: { _count: { select: { sessions: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async get(id: string, workspaceId: string) {
    return prisma.chatbot.findFirst({
      where: { id, workspaceId },
      include: { _count: { select: { sessions: true } } },
    });
  },

  async getPublic(id: string) {
    return prisma.chatbot.findFirst({
      where: { id, isActive: true },
      select: { id: true, name: true, greeting: true, primaryColor: true },
    });
  },

  async create(workspaceId: string, data: {
    name: string;
    persona?: string;
    greeting?: string;
    systemPrompt: string;
    primaryColor?: string;
  }) {
    return prisma.chatbot.create({ data: { workspaceId, ...data } });
  },

  async update(id: string, workspaceId: string, data: Partial<{
    name: string;
    persona: string;
    greeting: string;
    systemPrompt: string;
    primaryColor: string;
    isActive: boolean;
  }>) {
    return prisma.chatbot.update({ where: { id, workspaceId }, data });
  },

  async delete(id: string, workspaceId: string) {
    return prisma.chatbot.delete({ where: { id, workspaceId } });
  },

  async getSessions(chatbotId: string, workspaceId: string) {
    const bot = await prisma.chatbot.findFirst({ where: { id: chatbotId, workspaceId } });
    if (!bot) throw new Error('Not found');
    return prisma.chatSession.findMany({
      where: { chatbotId },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  },

  async chat(chatbotId: string, visitorId: string, userMessage: string) {
    const bot = await prisma.chatbot.findFirst({ where: { id: chatbotId, isActive: true } });
    if (!bot) throw new Error('Chatbot not found or inactive');

    let session = await prisma.chatSession.findFirst({ where: { chatbotId, visitorId } });
    const history: ChatMessage[] = session ? (session.messages as unknown as ChatMessage[]) : [];

    const systemPrompt = `${bot.systemPrompt}

You are ${bot.name}, a ${bot.persona}. Be concise, helpful, and friendly. Keep responses under 150 words unless a detailed answer is truly needed.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: [
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: userMessage },
      ],
    });

    const assistantReply = (response.content[0] as { type: string; text: string }).text;

    const updatedMessages: ChatMessage[] = [
      ...history,
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
      { role: 'assistant', content: assistantReply, timestamp: new Date().toISOString() },
    ];

    if (session) {
      await prisma.chatSession.update({
        where: { id: session.id },
        data: { messages: updatedMessages as never, updatedAt: new Date() },
      });
    } else {
      await prisma.chatSession.create({
        data: { chatbotId, visitorId, messages: updatedMessages as never },
      });
    }

    return { reply: assistantReply, sessionId: session?.id };
  },

  async chatStream(chatbotId: string, visitorId: string, userMessage: string, res: import('express').Response) {
    const bot = await prisma.chatbot.findFirst({ where: { id: chatbotId, isActive: true } });
    if (!bot) { res.status(404).end(); return; }

    let session = await prisma.chatSession.findFirst({ where: { chatbotId, visitorId } });
    const history: ChatMessage[] = session ? (session.messages as unknown as ChatMessage[]) : [];

    const systemPrompt = `${bot.systemPrompt}\n\nYou are ${bot.name}, a ${bot.persona}. Be concise, helpful, and friendly. Keep responses under 150 words unless a detailed answer is truly needed.`;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    let fullText = '';

    try {
      const stream = anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: systemPrompt,
        messages: [
          ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user', content: userMessage },
        ],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const token = event.delta.text;
          fullText += token;
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      }
    } catch {
      fullText = 'Sorry, an error occurred. Please try again.';
      res.write(`data: ${JSON.stringify({ token: fullText })}\n\n`);
    }

    // Persist session
    const updatedMessages: ChatMessage[] = [
      ...history,
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
      { role: 'assistant', content: fullText, timestamp: new Date().toISOString() },
    ];
    if (session) {
      await prisma.chatSession.update({ where: { id: session.id }, data: { messages: updatedMessages as never, updatedAt: new Date() } });
    } else {
      await prisma.chatSession.create({ data: { chatbotId, visitorId, messages: updatedMessages as never } });
    }

    res.write('data: [DONE]\n\n');
    res.end();
  },
};
