import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const unifiedKnowledgeBaseSchema = z.object({
    id: z.instanceof(ObjectId), // Unique identifier
    sourceType: z.string(), // Type of source entity
    sourceId: z.number(), // Original ID of the source entity
    content: z.string(), // Main text or title content
    url: z.string().nullable(), // Original URL of the source
    finalUrl: z.string().nullable(), // Final URL after redirection
    description: z.string().nullable(), // Additional description, mainly for News
    author: z.string(), // Author of the content
    baseEntityId: z.number(), // Base entity ID for reference
    createdAt: z.number(), // Timestamp of original creation
    fetchedAt: z.number(), // Timestamp of fetching into the system
    updatedAt: z.number().nullable(), // Timestamp of the last update
});

type UnifiedKnowledgeBaseType = z.infer<typeof unifiedKnowledgeBaseSchema>;

export class UnifiedKnowledgeBase implements UnifiedKnowledgeBaseType {
    /**
     * Database schema for UnifiedKnowledgeBase.
     */
    static Schema = {
        name: "UnifiedKnowledgeBase",
        properties: {
            id: 'id', // Unique identifier for each record
            sourceType: 'sourceType', // Type of source (e.g., 'Tweet', 'News', 'Content')
            sourceId: 'sourceId', // Original ID from the source entity
            content: 'content', // Main text content from Tweet or Content, or the title from News
            url: 'url', // URL to the original source, if available
            finalUrl: 'finalUrl', // Final destination URL after any redirections
            description: 'description', // Description, mainly for News
            author: 'author', // Author of the content, derived based on source type
            baseEntityId: 'baseEntityId', // ID of the base entity that acts as the source of information
            createdAt: 'createdAt', // Date and time when the content was originally created
            fetchedAt: 'fetchedAt', // Date and time when the content was fetched into the system
            updatedAt: 'updatedAt' // Date and time when the entry was last updated in the system
        },
    };

    // Method definitions...

    // Field definitions with descriptions
    readonly id: ObjectId; // Unique identifier
    readonly sourceType: string; // Type of source entity
    readonly sourceId: number; // Original ID of the source entity
    readonly content: string; // Main text or title content
    readonly url: string | null; // Original URL of the source
    readonly finalUrl: string | null; // Final URL after redirection
    readonly description: string | null; // Additional description, mainly for News
    readonly author: string; // Author of the content
    readonly baseEntityId: number; // Base entity ID for reference
    readonly createdAt: number; // Timestamp of original creation
    readonly fetchedAt: number; // Timestamp of fetching into the system
    readonly updatedAt: number | null; // Timestamp of the last update

    /**
     * Constructor for UnifiedKnowledgeBase.
     * @param {...} All the fields for initialization.
     */
    constructor(
        id: ObjectId,
        sourceType: string,
        sourceId: number,
        content: string,
        url: string | null,
        finalUrl: string | null,
        description: string | null,
        author: string,
        baseEntityId: number,
        createdAt: number,
        fetchedAt: number,
        updatedAt: number | null
    ) {
        // Initialization of fields
        this.id = id;
        this.sourceType = sourceType;
        this.sourceId = sourceId;
        this.content = content;
        this.url = url;
        this.finalUrl = finalUrl;
        this.description = description;
        this.author = author;
        this.baseEntityId = baseEntityId;
        this.createdAt = createdAt;
        this.fetchedAt = fetchedAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Extracts the author based on source type and content.
     * For Tweets: uses the title field.
     * For News: extracts suffix after '-' in the title.
     * @param sourceType The type of the source.
     * @param title The title of the content.
     * @returns {string} The author's name.
     **/

    static extractAuthor(sourceType: string, title: string): string {
        if (sourceType === 'Tweet') {
            return title;
        } else if (sourceType === 'News') {
            const parts = title.split('-');
            return parts.length > 1 ? parts[parts.length - 1].trim() : '';
        }
        return '';
    }

    /**
     * Factory method to create a UnifiedKnowledgeBase instance from different source types.
     * @param sourceType The type of the source ('Tweet', 'News', 'Content').
     * @param sourceObject The source object (Content, News, or Tweet).
     * @returns {UnifiedKnowledgeBase} An instance of UnifiedKnowledgeBase.
     */
    static createFromSource(sourceType: string, sourceObject: any): UnifiedKnowledgeBase {
        let content, url, finalUrl, description, author, createdAt, updatedAt, sourceId;
        const id = sourceObject.id;
        const baseEntityId = sourceObject.id; // Assuming it's the same as sourceId

        // Determine fields based on source type
        switch (sourceType) {
            case 'Tweet':
                sourceId = sourceObject.id;
                content = sourceObject.text;
                url = null; // Tweets might not have a separate URL field
                finalUrl = null;
                description = null;
                author = sourceObject.title; // Author is the title for Tweets
                createdAt = sourceObject.postTime;
                updatedAt = null;
                break;

            case 'News':
                sourceId = sourceObject.id;
                content = sourceObject.title;
                url = sourceObject.link;
                finalUrl = null; // To be filled in after resolving redirection
                description = sourceObject.description;
                author = sourceObject.title.split('-').pop().trim(); // Extract author from title
                createdAt = sourceObject.publicationDate;
                updatedAt = null;
                break;

            case 'Content':
                sourceId = sourceObject.id;
                content = sourceObject.content;
                url = sourceObject.baseUrl; // Assuming baseUrl is the URL
                finalUrl = null; // To be filled in after resolving redirection
                description = null; // Content might not have a description
                author = ''; // Author not defined for Content
                createdAt = sourceObject.relatedCreateAt; // Assuming this is the creation date
                updatedAt = null;
                break;

            default:
                throw new Error(`Unsupported source type: ${sourceType}`);
        }

        const fetchedAt = sourceObject.fetchedAt || Date.now(); // Use current time if not provided

        const result = new UnifiedKnowledgeBase(
            id, sourceType, sourceId, content, url, finalUrl, description, author, baseEntityId, createdAt, fetchedAt, updatedAt
        );

        return result
    }

}