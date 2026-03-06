import mongoose, { Document, Schema } from 'mongoose';

export interface IParty extends Document {
    hostId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    location: {
        type: string;
        coordinates: number[]; // [longitude, latitude]
    };
    startTime: Date;
    capacity?: number;
    privacy: 'Public' | 'Friends' | 'Invite Only';
    vibeScore: number;
    createdAt: Date;
    updatedAt: Date;
}

const PartySchema: Schema = new Schema(
    {
        hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String },
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true },
        },
        startTime: { type: Date, required: true },
        capacity: { type: Number },
        privacy: { type: String, enum: ['Public', 'Friends', 'Invite Only'], default: 'Public' },
        vibeScore: { type: Number, default: 0, min: 0, max: 10 },
    },
    { timestamps: true }
);

PartySchema.index({ location: '2dsphere' });

export default mongoose.model<IParty>('Party', PartySchema);
