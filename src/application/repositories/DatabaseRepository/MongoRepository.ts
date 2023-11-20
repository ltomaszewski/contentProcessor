import { MongoClient, Db, Collection } from 'mongodb';

// DatabaseRepository - a repository for interacting with MongoDB databases
export class DatabaseRepository {
    readonly uri: string;
    private client: MongoClient;
    private db: Db | null;

    constructor(uri: string) {
        this.uri = uri;
        this.client = new MongoClient(uri);
        this.db = null;
    }

    async connect(databaseName: string): Promise<void> {
        await this.client.connect();
        this.db = this.client.db(databaseName);
    }

    async closeConnection(): Promise<void> {
        await this.client.close();
    }

    async createCollectionIfNotExists(collectionName: string): Promise<void> {
        if (this.db === null) {
            throw new Error('Database is null');
        }

        const collections = await this.db.listCollections({ name: collectionName }, { nameOnly: true }).toArray();
        if (collections.length === 0) {
            await this.db.createCollection(collectionName);
        }
    }

    async dropDatabaseIfExists(databaseName: string): Promise<void> {
        if (this.client === null) {
            throw new Error('Client is null');
        }

        const dbList = await this.client.db().admin().listDatabases();
        if (dbList.databases.some(db => db.name === databaseName)) {
            await this.client.db(databaseName).dropDatabase();
        }
    }

    async insert(collectionName: string, object: any): Promise<void> {
        if (this.db === null) {
            throw new Error('Database is null');
        }

        const collection = this.db.collection(collectionName);
        await collection.insertOne(object);
    }

    async update(collectionName: string, filter: any, obj: any): Promise<void> {
        if (this.db === null) {
            throw new Error('Database is null');
        }

        const collection = this.db.collection(collectionName);
        await collection.updateOne(filter, { $set: obj });
    }

    async delete(collectionName: string, filter: any): Promise<void> {
        if (this.db === null) {
            throw new Error('Database is null');
        }

        const collection = this.db.collection(collectionName);
        await collection.deleteOne(filter);
    }

    async query(collectionName: string, query: any): Promise<any[]> {
        if (this.db === null) {
            throw new Error('Database is null');
        }

        const collection: Collection = this.db.collection(collectionName);
        return collection.find(query).toArray();
    }
}