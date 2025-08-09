
'use server';

import { generateFileTags as genkitGenerateFileTags, GenerateFileTagsInput } from '@/ai/flows/generate-file-tags';
import { z } from 'zod';

const fileSchema = z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileDataUri: z.string(),
});

export async function generateFileTags(input: GenerateFileTagsInput) {
    const validation = fileSchema.safeParse(input);
    if (!validation.success) {
        console.error("Invalid input for generateFileTags:", validation.error.errors);
        return { tags: [], error: "Invalid input." };
    }

    try {
        const result = await genkitGenerateFileTags(validation.data);
        return result;
    } catch (error) {
        console.error("Error generating tags:", error);
        return { tags: [], error: "Failed to generate tags." };
    }
}
