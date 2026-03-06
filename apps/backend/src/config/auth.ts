import { ClerkExpressWithAuth, type LooseAuthProp } from '@clerk/clerk-sdk-node';
import type { Request } from 'express';

export interface MyContext {
    auth?: LooseAuthProp;
}

// Middleware to parse and verify the Clerk token from the Authorization header
export const authMiddleware: any = ClerkExpressWithAuth({
    // Allows requests without tokens to pass through (so GraphQL schema introspection works)
    // We will enforce authentication inside specific GraphQL resolvers instead.
});

// Context builder for Apollo Server
export const getContext = ({ req }: { req: Request }): MyContext => {
    // @ts-ignore - clerk auth is injected by the middleware
    return { auth: req.auth };
};
