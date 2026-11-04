import { WorkflowAgent, type ModelCallStreamPart } from "@ai-sdk/workflow";
import { getWritable } from "workflow";
import { convertToModelMessages, type UIMessage } from "ai";
import {
	searchProducts,
	getAllCategories,
	returnOrder,
	getProductDetails,
} from "@/lib/tools";

export async function chatFlow(messages: UIMessage[]) {
	"use workflow";

	const modelMessages = await convertToModelMessages(messages);

	const agent = new WorkflowAgent({
		model: "anthropic/claude-sonnet-5",
		instructions: `You are a helpful assistant for the Vercel swag store. When the user asks about products, availability, or recommendations, use the searchProducts tool to look up real catalog data before answering. Use getAllCategories when the user asks about categories or wants to browse the store. Before filtering a product search by category, use getAllCategories to discover valid category slugs and use an exact returned slug. Never invent category slugs.
When the user asks about a specific item, use getProductDetails with its product ID or slug for details, images, sizing information, or live availability rather than relying on search summaries. Never invent sizing information that the catalog doesn't provide.
When the user wants to return an order, use the returnOrder tool. Ask for the order ID and reason if they haven't provided them. Example order IDs are 11111, 22222, and 33333.`,
		tools: { searchProducts, getAllCategories, returnOrder, getProductDetails },
	});

	await agent.stream({
		messages: modelMessages,
		writable: getWritable<ModelCallStreamPart>(),
	});
}
