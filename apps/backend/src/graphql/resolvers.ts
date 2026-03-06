import { Party, PartyMember, Post, VibeRating } from '../models';

export const resolvers = {
    Query: {
        hello: () => 'Hello from Bumpn API!',
        me: (parent: any, args: any, context: any) => {
            if (!context.auth || !context.auth.userId) {
                return 'Not authenticated';
            }
            return `Authenticated as Clerk User: ${context.auth.userId}`;
        },
        nearbyParties: async (_: any, { longitude, latitude }: { longitude: number, latitude: number }) => {
            // Find public parties near the location
            return Party.find({
                location: {
                    $near: {
                        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
                        $maxDistance: 10000 // 10km
                    }
                },
                privacy: 'Public'
            });
        },
        morningAfterRecap: async (_: any, { partyId }: { partyId: string }) => {
            const postsCount = await Post.countDocuments({ partyId });
            const attendeesCount = await PartyMember.countDocuments({ partyId });

            const topVibes = await VibeRating.aggregate([
                { $match: { partyId: partyId } },
                { $group: { _id: null, avgVibe: { $avg: '$rating' }, maxVibe: { $max: '$rating' } } }
            ]);

            const peakVibe = topVibes[0]?.maxVibe || 0;

            return {
                partyId,
                peakAttendance: attendeesCount,
                photosTaken: postsCount,
                topVibe: peakVibe,
            };
        }
    },
};
