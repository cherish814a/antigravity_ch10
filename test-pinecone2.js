const { Pinecone } = require('@pinecone-database/pinecone');
const { Embeddings } = require('@langchain/core/embeddings');

class CustomPineconeEmbeddings extends Embeddings {
  pc = new Pinecone();
  async embedDocuments(texts) {
    const res = await this.pc.inference.embed({
      model: 'llama-text-embed-v2',
      inputs: texts,
      parameters: { inputType: 'passage', truncate: 'END' }
    });
    return res.data.map((d) => d.values);
  }
  async embedQuery(text) {
    const res = await this.pc.inference.embed({
      model: 'llama-text-embed-v2',
      inputs: [text],
      parameters: { inputType: 'query', truncate: 'END' }
    });
    return res.data[0].values;
  }
}

async function run() {
    try {
        const pc = new Pinecone();
        const pineconeIndex = pc.Index('review-chatbot');
        const embeddings = new CustomPineconeEmbeddings();

        const docs = [{ pageContent: "test content", metadata: { id: 1, title: 'test', content: 'test content', rating: 5, author: 'test' } }];

        console.log("Embedding documents...");
        const embeddingsArray = await embeddings.embedDocuments(docs.map(d => d.pageContent));
        
        console.log("Upserting records...");
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

        console.log("Records length:", records.length);
        console.log("First record values type:", typeof records[0].values, "is array:", Array.isArray(records[0].values));

        await pineconeIndex.upsert(records);
        console.log("Success");
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
