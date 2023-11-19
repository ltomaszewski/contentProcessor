import { UnifiedKnowledgeBase } from "../../entities/UnifiedKnowledgeBase.js"
import { DatabaseRepository } from "./DatabaseRepository.js"

// Schema - responsible for database schema migration
export class Schema {
    databaseName: string
    private databaseRepository: DatabaseRepository

    constructor(databaseName: string, databaseRepository: DatabaseRepository) {
        this.databaseName = databaseName
        this.databaseRepository = databaseRepository
    }

    async updateSchemaIfNeeded(dropAllFirst: boolean = false) {
        if (dropAllFirst) {
            await this.databaseRepository.dropTableIfExists(this.databaseName, UnifiedKnowledgeBase.Schema.name)
            await this.databaseRepository.dropDatabaseIfExists(this.databaseName)
        }

        await this.databaseRepository.createTableIfNotExists(this.databaseName, UnifiedKnowledgeBase.Schema.name)
        await this.databaseRepository.createDatabaseIfNotExists(this.databaseName)
    }
}
