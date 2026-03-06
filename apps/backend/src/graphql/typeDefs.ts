export const typeDefs = `
  type Location {
    coordinates: [Float]
  }

  type Party {
    id: ID!
    title: String!
    vibeScore: Float
    location: Location
  }

  type MorningAfterRecap {
    partyId: ID!
    peakAttendance: Int!
    photosTaken: Int!
    topVibe: Float!
  }

  type Query {
    hello: String
    me: String
    nearbyParties(longitude: Float!, latitude: Float!): [Party]
    morningAfterRecap(partyId: ID!): MorningAfterRecap
  }
`;
