import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

dotenv.config();

import { authMiddleware, getContext } from './config/auth';

const app = express();
app.use(cors());
app.use(express.json());

// Enable Clerk auth parsing on all routes
app.use(authMiddleware);

import apiRoutes from './routes';
app.use('/api', apiRoutes);

import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/typeDefs';

const startServer = async () => {
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: getContext,
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app: app as any, path: '/graphql' });

    const PORT = process.env.PORT || 4000;

    // Connect to DB (will be replaced with actual URI later)
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB');
        } else {
            console.warn('MONGODB_URI not provided. Skipping DB connection.');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }

    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });
};

startServer().catch((err) => {
    console.error('Error starting server:', err);
});
