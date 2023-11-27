import { MongoClient } from "mongodb";
import { UnifiedKnowledgeBase } from "../entities/UnifiedKnowledgeBase.js";
import { MongoRepository } from "./DatabaseRepository/MongoRepository.js";

export class UnifiedKnowledgeBaseRepository extends MongoRepository<UnifiedKnowledgeBase> {
    constructor(client: MongoClient) {
        super(client, UnifiedKnowledgeBase.Schema.name);
    }
}