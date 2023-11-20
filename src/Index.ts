// Importing CLIConfiguration class for handling Command Line Interface (CLI) arguments
import 'dotenv/config';
import { Content, ContentFetcherDatabase } from "./application/services/ContentFetcherDatabase.js";
import { NewsAggregatorDatabase } from "./application/services/NewsAggregatorDatabase.js";
import { CLIConfiguration } from "./config/CLIConfiguration.js";
import { MongoClient } from 'mongodb';
import { dotEnv } from './config/Constants.js';
import { MongoUnifiedKnowledgeBaseService } from './application/services/MongoUnifiedKnowledgeBaseService.js';
import { UnifiedKnowledgeBase } from './application/entities/UnifiedKnowledgeBase.js';
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

    await contentFetcherDatabase.connect()
    await newsAggregatorDatabase.connect()

    const contentArray: Content[] = []
    await contentFetcherDatabase
        .contentWithForLoop(async (content) => {
            console.log(content.id + " fetchedAt " + content.fetchedAt);
            contentArray.push(content)
            return false
        },
            undefined)

    // await newsAggregatorDatabase
    //     .newsWithForLoop(async (news) => {
    //         console.log(news.id + " fetchedAt " + news.fetchedAt + " content " + news.title);
    //         return false
    //     },
    //         undefined)

    // await newsAggregatorDatabase
    //     .tweetsWithForLoop(async (tweet) => {
    //         console.log(tweet.id + " postTime " + tweet.postTime + " title " + tweet.title);
    //         return false
    //     },
    //         undefined)

    await contentFetcherDatabase.close()
    await newsAggregatorDatabase.close()

    const testInput: UnifiedKnowledgeBase[] = contentArray.map(content => { return UnifiedKnowledgeBase.createFromSource("Content", content) })
    console.log(testInput)

    const mongoClient = new MongoClient(dotEnv.DEV_MONGO_DB_URL);

    const mongoUnifiedKnowledgeBaseService = new MongoUnifiedKnowledgeBaseService(mongoClient)
    await mongoUnifiedKnowledgeBaseService.deleteAll()

    for (let input of testInput) {
        const mappedInput = UnifiedKnowledgeBaseDTO.convertFromEntity(input)
        const result = await mongoUnifiedKnowledgeBaseService.createUnifiedKnowledgeBase(mappedInput)
        console.log(result)
    }
})();
