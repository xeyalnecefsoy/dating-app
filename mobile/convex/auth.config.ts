// Convex Auth Configuration for Clerk
// This file configures JWT verification with Clerk

const authConfig = {
  providers: [
    {
      // Clerk's domain - will be replaced with actual value from env
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
