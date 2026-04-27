import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: [true, 'please provide a title for the document'],
        trim: true,
    },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileUrl: { type: String }, // Ensure this is in your schema
    fileSize: { type: Number, required: true },
    extractedText: { type: String, default: '' },
    chunks: [{
        content: { type: String, required: true },
        pageNumber: { type: Number, default: 0 },
        chunkIndex: { type: Number, required: true }
    }],
    status: {
        type: String,
        // ✅ Added 'processed' to match your controller
        enum: ['processing', 'processed', 'ready', 'error'], 
        default: 'processing'
    }
}, { timestamps: true });

documentSchema.index({ userId: 1, createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;