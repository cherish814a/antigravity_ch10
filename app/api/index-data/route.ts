import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { Document } from '@langchain/core/documents';
import { createClient } from '@/utils/supabase/server';
import { CustomPineconeEmbeddings } from '@/utils/pinecone';
import fs from 'fs';
import path from 'path';
import { csvParse } from 'd3-dsv';

export async function POST() {
  try {
    const filePath = path.join(process.cwd(), 'samples', 'review.csv');
    const csvString = fs.readFileSync(filePath, 'utf-8');
    const parsedData = csvParse(csvString);

    const docs = parsedData.map((row) => {
      return new Document({
        pageContent: `Title: ${row.title}\nContent: ${row.content}\nRating: ${row.rating}`,
        metadata: {
          id: parseInt(row.id!),
          rating: parseInt(row.rating!),
          title: row.title,
          content: row.content,
          author: row.author,
          date: row.date,
          helpful_votes: parseInt(row.helpful_votes!),
          verified_purchase: row.verified_purchase === 'true',
        },
      });
    });

    const supabase = await createClient();

    // 1. Insert into Supabase
    const reviewsData = docs.map((doc) => doc.metadata);

    const { error: dbError } = await supabase.from('reviews').upsert(reviewsData);

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return NextResponse.json({ error: 'Failed to insert data to Supabase', details: dbError }, { status: 500 });
    }

    // 2. Index in Pinecone
    const pc = new Pinecone();
    const pineconeIndex = pc.Index('review-chatbot');
    const embeddings = new CustomPineconeEmbeddings();

    const embeddingsArray = await embeddings.embedDocuments(docs.map(d => d.pageContent));
    
    const records = docs.map((doc, i) => ({
      id: doc.metadata.id.toString(),
      values: embeddingsArray[i],
      metadata: {
        id: doc.metadata.id,
        title: doc.metadata.title,
        content: doc.metadata.content,
        rating: doc.metadata.rating,
        author: doc.metadata.author,
      }
    }));

    await pineconeIndex.upsert({ records });

    return NextResponse.json({ message: 'Data successfully indexed!' });
  } catch (error) {
    console.error('Indexing error:', error);
    return NextResponse.json({ error: 'Failed to index data' }, { status: 500 });
  }
}
