import { MongoClient, Collection, ObjectId, WithId } from 'mongodb';

interface BaseDocument {
    _id?: ObjectId;
}

export class MongoRepository<T extends BaseDocument> {
    private collection: Collection<T>;

    constructor(db: MongoClient, collectionName: string) {
        this.collection = db.db().collection<T>(collectionName);
    }

    async create(item: Omit<T, '_id'>): Promise<WithId<T>> {
        const result = await this.collection.insertOne(item as any);
        return { ...item, _id: result.insertedId } as WithId<T>;
    }

    async findAll(): Promise<T[]> {
        const documents = await this.collection.find({}).toArray();
        return documents.map(doc => doc as T);
    }

    async findById(id: ObjectId): Promise<T | null> {
        const document = await this.collection.findOne({ _id: id } as any);
        return document as T | null;
    }

    async find(query: Partial<T>): Promise<T[]> {
        const documents = await this.collection.find(query as any).toArray();
        return documents.map(doc => doc as T);
    }

    async update(id: ObjectId, item: Partial<T>): Promise<T | null> {
        const result = await this.collection.findOneAndUpdate(
            { _id: id as any },
            { $set: item },
            { returnDocument: 'after' }
        );
        if (!result) return null;
        return result as T;
    }

    async delete(id: string): Promise<void> {
        await this.collection.deleteOne({ _id: new ObjectId(id) } as any);
    }

    async deleteAll() {
        try {
            const result = await this.collection.deleteMany({});
            console.log(`Deleted ${result.deletedCount} documents`);
        } catch (error) {
            console.error('Error deleting documents', error);
        } finally {
            console.log('Finished deleting documents');
        }
    }
}