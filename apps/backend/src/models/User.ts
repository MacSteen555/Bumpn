import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    clerkId: string;
    username: string;
    partyAnimal: string;
    friends: mongoose.Types.ObjectId[];
    joinedParties: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        clerkId: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        partyAnimal: { type: String, default: 'none' },
        friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        joinedParties: [{ type: Schema.Types.ObjectId, ref: 'Party' }],
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
