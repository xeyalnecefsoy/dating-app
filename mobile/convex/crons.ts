import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Keeps operational alerts automated so admins only intervene when needed.
crons.interval("ops-automation-sweep", { minutes: 15 }, internal.ops.runAutomationSweep, {});

// Söhbətgah: 30 gündən köhnə mesajları hər gün təmizləyir (sistemin şişməsinin qarşısını alır)
crons.interval("general-chat-cleanup", { hours: 24 }, internal.messages.cleanupOldGeneralChatMessages, {});

export default crons;
