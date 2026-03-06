import mongoose, { Document, Schema } from 'mongoose';

export interface IPartyMember extends Document {
    partyId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    role: 'host' | 'attendee' | 'banned';
    joinedAt: Date;
}

const PartyMemberSchema: Schema = new Schema(
    {
        partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['host', 'attendee', 'banned'], default: 'attendee' },
        joinedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

PartyMemberSchema.index({ partyId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IPartyMember>('PartyMember', PartyMemberSchema);
