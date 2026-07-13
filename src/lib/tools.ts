import { tool } from "ai";
import { z } from "zod";

// No `execute`: this is a client-side signal tool. The model calling it is
// itself the desired effect — the client renders the booking widget when it
// sees the tool-call part, per docs/adr/0001-lead-lifecycle.md's sibling
// decision to use tool calling (not a sentinel string) for reliability.
export const showBookingTool = tool({
  description:
    "Show the appointment booking widget. Call this when the visitor clearly wants to schedule, book, or set up an appointment.",
  inputSchema: z.object({}),
});

export const chatTools = { show_booking: showBookingTool };
