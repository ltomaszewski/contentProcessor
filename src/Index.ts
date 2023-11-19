// Importing CLIConfiguration class for handling Command Line Interface (CLI) arguments
import 'dotenv/config';
import { ContentFetcherDatabase } from "./application/services/ContentFetcherDatabase.js";
import { NewsAggregatorDatabase } from "./application/services/NewsAggregatorDatabase.js";
import { CLIConfiguration } from "./config/CLIConfiguration.js";

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

    // await contentFetcherDatabase
    //     .contentWithForLoop(async (content) => {
    //         console.log(content.id + " fetchedAt " + content.fetchedAt + " content " + content.content);
    //         return false
    //     },
    //         undefined)

    // await newsAggregatorDatabase
    //     .newsWithForLoop(async (news) => {
    //         console.log(news.id + " fetchedAt " + news.fetchedAt + " content " + news.title);
    //         return false
    //     },
    //         undefined)

    await newsAggregatorDatabase
        .tweetsWithForLoop(async (tweet) => {
            console.log(tweet.id + " postTime " + tweet.postTime + " title " + tweet.title);
            return false
        },
            undefined)

    await contentFetcherDatabase.close()
    await newsAggregatorDatabase.close()
})();
