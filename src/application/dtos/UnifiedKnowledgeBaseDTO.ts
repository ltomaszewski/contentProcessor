import { z } from 'zod';
import { unifiedKnowledgeBaseSchema, UnifiedKnowledgeBase } from '../entities/UnifiedKnowledgeBase.js';

export const unifiedKnowledgeBaseDTOSchema = z.object({
    id: z.string(),
    sourceType: unifiedKnowledgeBaseSchema.shape.sourceType,
    sourceId: unifiedKnowledgeBaseSchema.shape.sourceId,
    content: unifiedKnowledgeBaseSchema.shape.content,
    url: unifiedKnowledgeBaseSchema.shape.url,
    finalUrl: unifiedKnowledgeBaseSchema.shape.finalUrl,
    description: unifiedKnowledgeBaseSchema.shape.description,
    author: unifiedKnowledgeBaseSchema.shape.author,
    baseEntityId: unifiedKnowledgeBaseSchema.shape.baseEntityId,
    createdAt: unifiedKnowledgeBaseSchema.shape.createdAt,
    fetchedAt: unifiedKnowledgeBaseSchema.shape.fetchedAt,
    updatedAt: unifiedKnowledgeBaseSchema.shape.updatedAt,
});

export type UnifiedKnowledgeBaseDTO = z.infer<typeof unifiedKnowledgeBaseDTOSchema>;

export const UnifiedKnowledgeBaseDTO = {
    convertFromEntity(entity: UnifiedKnowledgeBase): UnifiedKnowledgeBaseDTO {
        const candidate: UnifiedKnowledgeBaseDTO = {
            id: entity._id.toString(),
            sourceType: entity.sourceType,
            sourceId: entity.sourceId,
            content: entity.content,
            url: entity.url,
            finalUrl: entity.finalUrl,
            description: entity.description,
            author: entity.author,
            baseEntityId: entity.baseEntityId,
            createdAt: entity.createdAt,
            fetchedAt: entity.fetchedAt,
            updatedAt: entity.updatedAt,
        };

        return unifiedKnowledgeBaseDTOSchema.parse(candidate);
    },
};