import mongoose, { Document, Schema } from 'mongoose';

export interface IVibeRating extends Document {
    partyId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    rating: number; // 0-10
}

const VibeRatingSchema: Schema = new Schema(
    {
        partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 0, max: 10 },
    },
    { timestamps: true }
);

// One rating per user per party
VibeRatingSchema.index({ partyId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IVibeRating>('VibeRating', VibeRatingSchema);
