import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Keeps operational alerts automated so admins only intervene when needed.
crons.interval("ops-automation-sweep", { minutes: 15 }, internal.ops.runAutomationSweep, {});

export default crons;
