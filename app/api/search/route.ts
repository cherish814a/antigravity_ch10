import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { CustomPineconeEmbeddings } from '@/utils/pinecone';
import { ChatOpenAI } from '@langchain/openai';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const pc = new Pinecone();
    const pineconeIndex = pc.Index('review-chatbot');
    const embeddings = new CustomPineconeEmbeddings();

    const queryEmbedding = await embeddings.embedQuery(query);
    
    const results = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true
    });

    const matches = results.matches || [];

    let aiMessage = '';

    if (matches.length > 0) {
      const context = matches
        .map((m, idx) => `[리뷰 ${idx + 1}]
제목: ${m.metadata?.title}
평점: ${m.metadata?.rating}점
내용: ${m.metadata?.content}`)
        .join('\n\n');

      const chatModel = new ChatOpenAI({
        modelName: 'gpt-5-nano',
        apiKey: process.env.OPENAI_API_KEY,
      });

      const systemPrompt = `당신은 'InsightEngine AI'라는 이름의 친절하고 전문적인 쇼핑몰 리뷰 분석 챗봇입니다.
사용자가 '프리미엄 무선 이어폰 Pro' 제품 리뷰에 대해 물어보는 질문에 답변해 주세요.

반드시 아래 제공된 고객 리뷰 목록(Context)만을 바탕으로 정직하고 신뢰성 있게 답변해야 합니다.
제공된 리뷰와 관련 없는 엉뚱한 상상을 하거나 일반적인 사실을 꾸며내지 마세요.
답변은 친근하고 정중한 한국어 존댓말로 작성해 주세요. 핵심 내용을 요약하여 명확하게 전달해 주세요.

제공된 고객 리뷰 목록:
---
${context}
---`;

      const response = await chatModel.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ]);

      aiMessage = String(response.content);
    } else {
      aiMessage = '죄송합니다. 관련된 제품 리뷰를 찾을 수 없어 답변을 드릴 수 없습니다. 다른 검색어를 입력해 주세요.';
    }

    return NextResponse.json({
      message: aiMessage,
      results: matches.map(match => ({
        id: match.metadata?.id,
        content: match.metadata?.content,
        title: match.metadata?.title,
        rating: match.metadata?.rating,
        author: match.metadata?.author,
        matchPercentage: Math.round((match.score || 0) * 100),
      })),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
