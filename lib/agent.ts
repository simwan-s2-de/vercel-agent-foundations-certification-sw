/**
 * This is where your agent will live.
 *
 * During the workshop you'll define a `ToolLoopAgent` here, give it a model
 * and instructions, and later add tools (web search, sandbox, etc.). The
 * route handler in `app/api/chat/route.ts` and the `useChat` call in
 * `components/agent-chat.tsx` will both import from this file.
 *
 * Workshop docs: https://agent-foundations-certification.vercel.app/docs/chat-agent
 */

import {
	ToolLoopAgent,
	type InferAgentUIMessage,
	type UIToolInvocation,
} from "ai";
import { getAllCategories, getProductDetails, returnOrder, searchProducts } from "@/lib/tools";

export const shoppingAgent = new ToolLoopAgent({
	model: "anthropic/claude-sonnet-5",
	instructions: `You are a helpful assistant for the Vercel swag store. When the user asks about products, availability, or recommendations, use the searchProducts tool to look up real catalog data before answering. Use getAllCategories when the user asks about categories or wants to browse the store. Before filtering a product search by category, use getAllCategories to discover valid category slugs and use an exact returned slug. Never invent category slugs.
When the user asks about a specific item, use getProductDetails with its product ID or slug for details, images, sizing information, or live availability rather than relying on search summaries. Never invent sizing information that the catalog doesn't provide.
When the user wants to return an order, use the returnOrder tool. Ask for the order ID and reason if they haven't provided them. Example order IDs are 11111, 22222, and 33333.`,
	tools: { searchProducts, getAllCategories, returnOrder, getProductDetails },
});

export type ShoppingAgentUIMessage = InferAgentUIMessage<typeof shoppingAgent>;
export type SearchProductsToolInvocation = UIToolInvocation<typeof searchProducts>;
export type ProductDetailsToolInvocation = UIToolInvocation<typeof getProductDetails>;
