import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { currentTimeInSeconds } from '../helpers/DateUtils.js';

export const SourceTypeEnum = z.enum(["News", "Content", "Tweet"]);

export const unifiedKnowledgeBaseSchema = z.object({
    _id: z.instanceof(ObjectId), // Unique identifier
    sourceType: SourceTypeEnum, // Type of source entity
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
            _id: 'id', // Unique identifier for each record
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
    readonly _id: ObjectId; // Unique identifier
    readonly sourceType: "News" | "Content" | "Tweet"; // Type of source entity
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
        _id: ObjectId,
        sourceType: "News" | "Content" | "Tweet",
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
        this._id = _id;
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
        if (sourceType === SourceTypeEnum.enum.Tweet) {
            return title;
        } else if (sourceType === SourceTypeEnum.enum.News) {
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
        let content, url, finalUrl, description, author, createdAt, updatedAt, sourceId, fetchedAt, baseEntityId;

        // Determine fields based on source type
        switch (sourceType) {
            case SourceTypeEnum.enum.Tweet:
                baseEntityId = sourceObject.id
                sourceId = sourceObject.id;
                content = sourceObject.text;
                url = null; // Tweets might not have a separate URL field
                finalUrl = null;
                description = null;
                author = sourceObject.title; // Author is the title for Tweets
                createdAt = sourceObject.postTime;
                fetchedAt = sourceObject.postTime;
                updatedAt = currentTimeInSeconds();
                break;

            case SourceTypeEnum.enum.News:
                baseEntityId = sourceObject.id_source;
                sourceId = sourceObject.id;
                content = sourceObject.title;
                url = sourceObject.link;
                finalUrl = null; // To be filled in after resolving redirection
                description = sourceObject.description;
                if (sourceObject.link.includes("news.google.com")) {
                    // Existing logic to extract author from title
                    author = sourceObject.title.split('-').pop().trim();
                } else {
                    // Logic to use hostname when link is not from Google News
                    try {
                        const url = new URL(sourceObject.link);
                        author = url.hostname;
                    } catch (error) {
                        // Handle error (e.g., invalid URL)
                        console.error("Error parsing URL:", error);
                        author = "-1";
                    }
                }
                createdAt = sourceObject.publicationDate;
                fetchedAt = sourceObject.fetchedAt;
                updatedAt = currentTimeInSeconds();
                break;
            case SourceTypeEnum.enum.Content:
                baseEntityId = sourceObject.relatedNewsId !== -1 ? sourceObject.relatedNewsId : sourceObject.relatedTweetId;
                sourceId = sourceObject.id;
                content = sourceObject.content;
                url = sourceObject.baseUrl; // Assuming baseUrl is the URL
                finalUrl = sourceObject.url.length > 1 ? sourceObject.url : null;
                description = null; // Content might not have a description
                try {
                    if (sourceObject.url.length > 0) {
                        const url = new URL(sourceObject.url);
                        author = url.hostname;
                    } else {
                        if (sourceObject.baseUrl.startsWith("https://")) {
                            const url = new URL(sourceObject.baseUrl);
                            author = url.hostname;
                        } else {
                            const url = new URL("https://" + sourceObject.baseUrl);
                            author = url.hostname;
                        }
                    }
                } catch (error) {
                    // Handle error (e.g., invalid URL)
                    console.error("Error parsing URL:", error);
                    author = "-1";
                }
                createdAt = sourceObject.relatedCreateAt; // Assuming this is the creation date
                fetchedAt = sourceObject.fetchedAt || currentTimeInSeconds(); // Use current time if not provided
                updatedAt = currentTimeInSeconds();
                break;
            default:
                throw new Error(`Unsupported source type: ${sourceType}`);
        }

        const result = new UnifiedKnowledgeBase(
            new ObjectId(sourceObject.id), sourceType, sourceId, content, url, finalUrl, description, author, baseEntityId, createdAt, fetchedAt, updatedAt
        );

        return result
    }

}