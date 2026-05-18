const { Pinecone } = require('@pinecone-database/pinecone');
const { PineconeStore } = require('@langchain/pinecone');
const { Document } = require('@langchain/core/documents');
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

        const docs = [
            new Document({ pageContent: "test", metadata: { id: 1 } })
        ];

        console.log("Starting index...");
        await PineconeStore.fromDocuments(docs, embeddings, {
            pineconeIndex,
            ids: docs.map(d => String(d.metadata.id))
        });
        console.log("Success");
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
