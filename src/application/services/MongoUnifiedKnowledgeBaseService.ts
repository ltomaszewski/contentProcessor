import { MongoClient, Db, ObjectId } from "mongodb";
import { UnifiedKnowledgeBase, unifiedKnowledgeBaseSchema } from "../entities/UnifiedKnowledgeBase.js";
import { UnifiedKnowledgeBaseDTO } from "../dtos/UnifiedKnowledgeBaseDTO.js";

export class MongoUnifiedKnowledgeBaseService {
    private readonly db: Db;

    constructor(mongoClient: MongoClient) {
        this.db = mongoClient.db();
    }

    private getUnifiedKnowledgeBaseCollection() {
        return this.db.collection<UnifiedKnowledgeBase>(UnifiedKnowledgeBase.Schema.name);
    }

    async findUnifiedKnowledgeBase(id: string): Promise<UnifiedKnowledgeBaseDTO | null> {
        const entity = await this.getUnifiedKnowledgeBaseCollection().findOne({ _id: new ObjectId(id) });
        return entity ? UnifiedKnowledgeBaseDTO.convertFromEntity(entity) : null;
    }

    async createUnifiedKnowledgeBase(dto: Omit<UnifiedKnowledgeBaseDTO, "id">): Promise<UnifiedKnowledgeBaseDTO> {
        const candidate = unifiedKnowledgeBaseSchema.parse(
            {
                ...dto,
                id: new ObjectId(),
            }
        );
        const { insertedId } = await this.getUnifiedKnowledgeBaseCollection().insertOne(candidate);
        return UnifiedKnowledgeBaseDTO.convertFromEntity({ ...dto, id: insertedId });
    }

    async updateUnifiedKnowledgeBase(id: string, dto: Omit<Partial<UnifiedKnowledgeBaseDTO>, "id">): Promise<UnifiedKnowledgeBaseDTO | null> {
        const candidate = unifiedKnowledgeBaseSchema.partial().parse(dto);

        const updatedEntity = await this.getUnifiedKnowledgeBaseCollection().findOneAndUpdate(
            { id: new ObjectId(id) },
            { $set: candidate },
            { returnDocument: "after" }
        );
        return updatedEntity ? UnifiedKnowledgeBaseDTO.convertFromEntity(updatedEntity) : null;
    }

    async deleteUnifiedKnowledgeBase(id: string): Promise<void> {
        await this.getUnifiedKnowledgeBaseCollection().deleteOne({ _id: new ObjectId(id) });
    }

    async deleteAll() {
        try {
            const result = await this.getUnifiedKnowledgeBaseCollection().deleteMany({});
            console.log(`Deleted ${result.deletedCount} documents`);
        } catch (error) {
            console.error('Error deleting documents', error);
        } finally {
            console.log('Finished deleting documents');
        }
    }
}
