/**
 * Represents a unified knowledge base entry, consolidating data from various sources.
 */
export class UnifiedKnowledgeBase {
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
    readonly id: number; // Unique identifier
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
        id: number,
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

}
