import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
    partyId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    createdAt: Date;
}

const PostSchema: Schema = new Schema(
    {
        partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        mediaUrl: { type: String, required: true },
        mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    },
    { timestamps: true }
);

PostSchema.index({ partyId: 1, createdAt: -1 });

export default mongoose.model<IPost>('Post', PostSchema);
