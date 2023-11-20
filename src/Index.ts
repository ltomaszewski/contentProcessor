// Importing CLIConfiguration class for handling Command Line Interface (CLI) arguments
import 'dotenv/config';
import { Content, ContentFetcherDatabase } from "./application/services/ContentFetcherDatabase.js";
import { NewsAggregatorDatabase } from "./application/services/NewsAggregatorDatabase.js";
import { CLIConfiguration } from "./config/CLIConfiguration.js";
import { MongoClient } from 'mongodb';
import { dotEnv } from './config/Constants.js';
import { MongoUnifiedKnowledgeBaseService } from './application/services/MongoUnifiedKnowledgeBaseService.js';
import { SourceTypeEnum, UnifiedKnowledgeBase } from './application/entities/UnifiedKnowledgeBase.js';
import { UnifiedKnowledgeBaseDTO } from './application/dtos/UnifiedKnowledgeBaseDTO.js';

// Extracting command line arguments
const args = process.argv;

// Creating CLIConfiguration object from the extracted CLI arguments
export const configuration: CLIConfiguration = CLIConfiguration.fromCommandLineArguments(args);

// Logging the configuration details
console.log("Application started with environment: " + configuration.env);

// Asynchronous function for database operations
(async () => {
    const contentFetcherDatabase = new ContentFetcherDatabase()
    const newsAggregatorDatabase = new NewsAggregatorDatabase()
    const mongoClient = new MongoClient(dotEnv.DEV_MONGO_DB_URL);
    const mongoUnifiedKnowledgeBaseService = new MongoUnifiedKnowledgeBaseService(mongoClient)
    await mongoUnifiedKnowledgeBaseService.deleteAll()


    await contentFetcherDatabase.connect()
    await newsAggregatorDatabase.connect()

    await contentFetcherDatabase
        .contentWithForLoop(async (content) => {
            const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.Content, content)
            const unifiedKnowledgeBaseDTO = UnifiedKnowledgeBaseDTO.convertFromEntity(unifiedKnowledgeBase)
            const result = await mongoUnifiedKnowledgeBaseService.createUnifiedKnowledgeBase(unifiedKnowledgeBaseDTO)
            return false
        },
            undefined)

    await newsAggregatorDatabase
        .newsWithForLoop(async (news) => {
            const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.News, news)
            const unifiedKnowledgeBaseDTO = UnifiedKnowledgeBaseDTO.convertFromEntity(unifiedKnowledgeBase)
            const result = await mongoUnifiedKnowledgeBaseService.createUnifiedKnowledgeBase(unifiedKnowledgeBaseDTO)
            return false
        },
            undefined)

    await newsAggregatorDatabase
        .tweetsWithForLoop(async (tweet) => {
            const unifiedKnowledgeBase = UnifiedKnowledgeBase.createFromSource(SourceTypeEnum.enum.Tweet, tweet)
            const unifiedKnowledgeBaseDTO = UnifiedKnowledgeBaseDTO.convertFromEntity(unifiedKnowledgeBase)
            const result = await mongoUnifiedKnowledgeBaseService.createUnifiedKnowledgeBase(unifiedKnowledgeBaseDTO)
            return false
        },
            undefined)

    console.log("Done")

    await contentFetcherDatabase.close()
    await newsAggregatorDatabase.close()
})();
