import { Pinecone } from '@pinecone-database/pinecone';
import { Embeddings, EmbeddingsParams } from '@langchain/core/embeddings';

export class CustomPineconeEmbeddings extends Embeddings {
  pc = new Pinecone();

  constructor(fields?: EmbeddingsParams) {
    super(fields ?? {});
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const batchSize = 90;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const res = await this.pc.inference.embed({
        model: 'llama-text-embed-v2',
        inputs: batch,
        parameters: {
          inputType: 'passage',
          truncate: 'END',
        }
      });
      if (res.data) {
        const embeddings = res.data.map((d: any) => d.values!);
        results.push(...embeddings);
      }
    }

    return results;
  }

  async embedQuery(text: string): Promise<number[]> {
    const res = await this.pc.inference.embed({
      model: 'llama-text-embed-v2',
      inputs: [text],
      parameters: {
        inputType: 'query',
        truncate: 'END',
      }
    });
    return (res.data[0] as any).values!;
  }
}
