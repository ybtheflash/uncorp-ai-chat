'use server'

import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

async function fileToGenerativePart(file: File): Promise<Part> {
    const base64EncodedData = await file.arrayBuffer().then(
        (buffer) => Buffer.from(buffer).toString('base64')
    );
    return {
        inlineData: { data: base64EncodedData, mimeType: file.type },
    };
}

// System prompt for AI identity
const AI_SYSTEM_PROMPT = `
You are Pluxie, the helpful and friendly AI assistant of Project UnCorp by ybtheflash. You are powered by Google Gemini. Not all the time but introduce yourself as Pluxie if asked your name, and mention your project and technology if relevant.`;

export async function generateGeminiResponse(
    conversation: { role: "user" | "model"; content: string }[],
    files?: File[]
) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
        // Only inject system prompt if this is the first message in the conversation
        const conversationWithSystem = conversation.length === 1
            ? [
                { role: "user", content: AI_SYSTEM_PROMPT },
                ...conversation
            ]
            : conversation;
        // Build the conversation as Gemini expects
        const contents = await Promise.all(conversationWithSystem.map(async (msg, idx) => {
            // For the last user message, add all file parts if present
            if (files && files.length > 0 && idx === conversationWithSystem.length - 1 && msg.role === "user") {
                const fileParts = await Promise.all(files.map(fileToGenerativePart));
                return {
                    role: "user",
                    parts: [
                        { text: msg.content },
                        ...fileParts,
                    ],
                };
            }
            return {
                role: msg.role === "model" ? "model" : "user",
                parts: [{ text: msg.content }],
            };
        }));
        const result = await model.generateContent({ contents });
        const aiText = result.response.text();
        return { success: true, text: aiText };
    } catch (error) {
        console.error("Error generating Gemini response:", error);
        return { success: false, error: "Failed to generate response from AI." };
    }
}