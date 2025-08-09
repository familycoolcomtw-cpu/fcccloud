/**
 * @fileOverview A flow for generating descriptive tags for uploaded files using AI.
 *
 * - generateFileTags - A function that handles the generation of file tags.
 * - GenerateFileTagsInput - The input type for the generateFileTags function.
 * - GenerateFileTagsOutput - The return type for the generateFileTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFileTagsInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().describe('The name of the file.'),
  fileType: z.string().describe('The type of the file (e.g., pdf, image, text).'),
});
export type GenerateFileTagsInput = z.infer<typeof GenerateFileTagsInputSchema>;

const GenerateFileTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('Descriptive tags for the file.'),
});
export type GenerateFileTagsOutput = z.infer<typeof GenerateFileTagsOutputSchema>;

export async function generateFileTags(input: GenerateFileTagsInput): Promise<GenerateFileTagsOutput> {
  return generateFileTagsFlow(input);
}

const generateFileTagsPrompt = ai.definePrompt({
  name: 'generateFileTagsPrompt',
  input: {schema: GenerateFileTagsInputSchema},
  output: {schema: GenerateFileTagsOutputSchema},
  prompt: `You are an AI assistant that generates descriptive tags for files.

  Based on the file name and file type, generate a list of tags that can be used to easily search and organize the file.
  {{#ifCond fileType "!==" "image"}}
  {{#ifCond fileType "!==" "video"}}
  {{#ifCond fileType "!==" "audio"}}
  If the file is not a media file, you can also use the file content to generate more accurate tags.
  File Content (first 1024 characters): {{#slice fileDataUri 0 1024}}{{/slice}}
  {{/ifCond}}
  {{/ifCond}}
  {{/ifCond}}

  File Name: {{{fileName}}}
  File Type: {{{fileType}}}

  Tags:`,
});

const generateFileTagsFlow = ai.defineFlow(
  {
    name: 'generateFileTagsFlow',
    inputSchema: GenerateFileTagsInputSchema,
    outputSchema: GenerateFileTagsOutputSchema,
  },
  async input => {
    const {output} = await generateFileTagsPrompt(input);
    return output!;
  }
);
