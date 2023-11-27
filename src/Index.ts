// Importing CLIConfiguration class for handling Command Line Interface (CLI) arguments
import 'dotenv/config';
import { CLIConfiguration } from "./config/CLIConfiguration.js";
import { MongoClient } from 'mongodb';
import { dotEnv } from './config/Constants.js';
import { UnifiedKnowledgeBaseService } from './application/services/UnifiedKnowledgeBaseService.js';
import { UnifiedKnowledgeBaseRepository } from './application/repositories/UnifiedKnowledgeBaseRepository.js';
import { ContentCollectorService } from './application/services/ContentCollectorService.js';

// Extracting command line arguments
const args = process.argv;

// Creating CLIConfiguration object from the extracted CLI arguments
export const configuration: CLIConfiguration = CLIConfiguration.fromCommandLineArguments(args);

// Logging the configuration details
console.log("Application started with environment: " + configuration.env);

// Asynchronous function for database operations
(async () => {
    const mongoClient = new MongoClient(dotEnv.DEV_MONGO_DB_URL);
    const repository = new UnifiedKnowledgeBaseRepository(mongoClient);
    const unifiedKnowledgeBaseService = new UnifiedKnowledgeBaseService(repository);
    await unifiedKnowledgeBaseService.deleteAll();

    const contentCollectorService = new ContentCollectorService(unifiedKnowledgeBaseService);
    await contentCollectorService.start();

    console.log("Started");
})();
