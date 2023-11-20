import _ from "lodash"
import { MongoClient } from "mongodb"

// Schema - responsible for database schema migration
export class MongoSchema {
    databaseName: string
    private mongoClient: MongoClient

    constructor(databaseName: string, mongoClient: MongoClient) {
        this.databaseName = databaseName
        this.mongoClient = mongoClient
    }

    async updateSchemaIfNeeded(dropAllFirst: boolean = false) {
        if (dropAllFirst) {
            try {
                await this.mongoClient.db().dropCollection("users");
            } catch (e) {
                if (_.get(e, "codeName") !== "NamespaceNotFound") {
                    throw e;
                }
                console.log(`Collection "users" does not exist, no need to drop`);
            }
        }
    }
}
