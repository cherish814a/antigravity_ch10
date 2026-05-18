import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { Document } from '@langchain/core/documents';
import { CustomPineconeEmbeddings } from './utils/pinecone.js';

// Setup environment variables (manually for test script since next.js isn't loading it here, or just use dotenv)
import dotenv from 'dotenv';
dotenv.config();

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
        });
        console.log("Success");
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
