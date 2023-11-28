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
                    try {
                        const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.Content, newContent)
                        await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                    } catch (err) {
                        console.error(err);
                    }
                    return false
                }
            });

        console.log("Starting tweets change tracking...");
        await this.newsAggregatorDatabase
            .tweetsTrackChanges(async (newTweet, oldTweet, err) => {
                if (oldTweet === undefined && newTweet) {
                    try {
                        const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.Tweet, newTweet)
                        await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                    } catch (err) {
                        console.error(err);
                    }
                    return false
                }
            });

        console.log("Starting news change tracking...");
        await this.newsAggregatorDatabase
            .newsTrackChanges(async (newNews, oldNews, err) => {
                if (oldNews === undefined && newNews) {
                    try {
                        const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.News, newNews)
                        await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                    } catch (err) {
                        console.error(err);
                    }
                    return false
                }
            });

        console.log("Starting scraper item change tracking...");
        await this.newsAggregatorDatabase
            .scraperItemTrackChanges(async (newScraperItem, oldScraperItem, err) => {
                if (oldScraperItem === undefined && newScraperItem) {
                    try {
                        const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.ScraperItem, newScraperItem)
                        await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                    } catch (err) {
                        console.error(err);
                    }
                    return false
                }
            });

        console.log("Fetching content from content database...");
        await this.contentFetcherDatabase
            .contentWithForLoop(async (content) => {
                try {
                    const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.Content, content);
                    await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                } catch { }
                return false;
            },
                undefined);

        console.log("Fetching content from news database...");
        await this.newsAggregatorDatabase
            .newsWithForLoop(async (news) => {
                try {
                    const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.News, news)
                    await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                } catch { }
                return false
            },
                undefined);

        console.log("Fetching tweets from news database...");
        await this.newsAggregatorDatabase
            .tweetsWithForLoop(async (tweet) => {
                try {
                    const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.Tweet, tweet)
                    await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                } catch { }
                return false
            },
                undefined);

        console.log("Fetching scraper items from news database...");
        await this.newsAggregatorDatabase
            .scraperItemWithForLoop(async (scraperItem) => {
                try {
                    const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.ScraperItem, scraperItem)
                    await this.unifiedKnowledgeBaseService.create(unifiedKnowledgeBase);
                } catch { }
                return false
            },
                undefined);
    }
}