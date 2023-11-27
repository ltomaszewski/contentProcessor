import { MongoClient, Db, ObjectId, WithId } from "mongodb";
import { UnifiedKnowledgeBase, unifiedKnowledgeBaseSchema } from "../entities/UnifiedKnowledgeBase.js";
import { UnifiedKnowledgeBaseRepository } from "../repositories/UnifiedKnowledgeBaseRepository.js";

export class UnifiedKnowledgeBaseService {
    private readonly repository: UnifiedKnowledgeBaseRepository;

    constructor(repository: UnifiedKnowledgeBaseRepository) {
        this.repository = repository;
    }

    async create(item: Omit<UnifiedKnowledgeBase, '_id'>): Promise<WithId<UnifiedKnowledgeBase>> {
        const existingItem = await this.repository.find({ content: item.content, sourceType: item.sourceType });
        if (existingItem.length > 0) {
            throw new Error('Item already exists');
        }
        return await this.repository.create(item);
    }

    async findAll(): Promise<UnifiedKnowledgeBase[]> {
        return await this.repository.findAll();
    }

    async update(id: ObjectId, item: Partial<UnifiedKnowledgeBase>): Promise<UnifiedKnowledgeBase | null> {
        return await this.repository.update(id, item);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async deleteAll() {
        await this.repository.deleteAll();
    }
}