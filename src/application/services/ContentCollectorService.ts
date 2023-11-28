import { SourceTypeEnum, UnifiedKnowledgeBase } from "../entities/UnifiedKnowledgeBase.js";
import { ContentFetcherDatabase } from "./ContentFetcherDatabase.js";
import { NewsAggregatorDatabase } from "./NewsAggregatorDatabase.js";
import { UnifiedKnowledgeBaseService } from "./UnifiedKnowledgeBaseService.js";

export class ContentCollectorService {
    private contentFetcherDatabase = new ContentFetcherDatabase();
    private newsAggregatorDatabase = new NewsAggregatorDatabase();
    private unifiedKnowledgeBaseService: UnifiedKnowledgeBaseService;

    constructor(unifiedKnowledgeBaseService: UnifiedKnowledgeBaseService) {
        this.unifiedKnowledgeBaseService = unifiedKnowledgeBaseService;
    }

    async start() {
        await this.contentFetcherDatabase.connect();
        await this.newsAggregatorDatabase.connect();

        console.log("Starting content change tracking...");
        await this.contentFetcherDatabase
            .contentTrackChanges(async (newContent, oldContent, err) => {
                if (oldContent === undefined && newContent) {
                    const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.Content, newContent)
                    try {
                        await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                    } catch { }
                    return false
                }
            });

        console.log("Starting tweets change tracking...");
        await this.newsAggregatorDatabase
            .tweetsTrackChanges(async (newTweet, oldTweet, err) => {
                if (oldTweet === undefined && newTweet) {
                    const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.Tweet, newTweet)
                    try {
                        await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                    } catch { }
                    return false
                }
            });

        console.log("Starting news change tracking...");
        await this.newsAggregatorDatabase
            .newsTrackChanges(async (newNews, oldNews, err) => {
                if (oldNews === undefined && newNews) {
                    const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.News, newNews)
                    try {
                        await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                    } catch { }
                    return false
                }
            });

        console.log("Starting scraper item change tracking...");
        await this.newsAggregatorDatabase
            .scraperItemTrackChanges(async (newScraperItem, oldScraperItem, err) => {
                if (oldScraperItem === undefined && newScraperItem) {
                    const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.ScraperItem, newScraperItem)
                    try {
                        await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                    } catch { }
                    return false
                }
            });

        console.log("Fetching content from content database...");
        await this.contentFetcherDatabase
            .contentWithForLoop(async (content) => {
                const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.Content, content);
                try {
                    await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                } catch { }
                return false;
            },
                undefined);

        console.log("Fetching content from news database...");
        await this.newsAggregatorDatabase
            .newsWithForLoop(async (news) => {
                const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.News, news)
                try {
                    await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                } catch { }
                return false
            },
                undefined);

        console.log("Fetching tweets from news database...");
        await this.newsAggregatorDatabase
            .tweetsWithForLoop(async (tweet) => {
                const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.Tweet, tweet)
                try {
                    await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                } catch { }
                return false
            },
                undefined);

        console.log("Fetching scraper items from news database...");
        await this.newsAggregatorDatabase
            .scraperItemWithForLoop(async (scraperItem) => {
                const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.ScraperItem, scraperItem)
                try {
                    await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                } catch { }
                return false
            },
                undefined);
    }
}