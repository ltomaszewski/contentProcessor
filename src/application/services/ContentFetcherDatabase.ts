import * as r from 'rethinkdb';
import { DatabaseHost, DatabasePort, baseContentFetcherDatabaseName } from "../../config/Constants.js";
import { DatabaseRepository } from "../repositories/DatabaseRepository/DatabaseRepository.js";

export class ContentFetcherDatabase {
    private databaseRepository: DatabaseRepository;
    private databaseName: string;

    constructor() {
        this.databaseName = `${baseContentFetcherDatabaseName}`;
        this.databaseRepository = new DatabaseRepository(DatabaseHost, DatabasePort, false)
    }

    async connect() {
        await this.databaseRepository.connect(this.databaseName, false);
    }

    async close() {
        await this.databaseRepository.closeConnection()
    }

    async contentWithForLoop(forLoop: (tweet: Content) => Promise<boolean>, lastfetchedAt: number | undefined) {
        const result = (await this.databaseRepository.query(
            this.databaseName,
            Content.Schema.name,
            function (table) {
                if (lastfetchedAt) {
                    return table
                        .orderBy({ index: r.desc('id') })
                        .filter(r.row('fetchedAt').gt(lastfetchedAt))
                } else {
                    return table
                        .orderBy({ index: r.desc('id') })
                }
            }))
        try {
            let nextEntity
            let nextTweet
            while (result.hasNext) {
                nextEntity = await result.next()
                nextTweet = Content.createFromObject(nextEntity)
                const shouldStop = await forLoop(nextTweet)
                if (shouldStop) {
                    await result.close()
                    return
                }
            }
        } catch { }
        await result.close()
    }

    async contentTrackChanges(change: (newTweet: Content | undefined, oldTweet: Content | undefined, err: Error) => void) {
        await this.databaseRepository.changes(this.databaseName, Content.Schema.name, (new_val, oldVal, err) => {
            let newTweet: Content | undefined = undefined;
            if (new_val) {
                newTweet = Content.createFromObject(new_val);
            }
            let oldTweet: Content | undefined = undefined;
            if (oldVal) {
                oldTweet = Content.createFromObject(oldVal);
            }
            change(newTweet, oldTweet, err);
        });
    }
}

export class Content {
    static Schema = {
        name: "Content",
    };
    readonly id: number
    readonly id_configuration: number
    readonly relatedNewsId: number
    readonly relatedTweetId: number
    readonly relatedCreateAt: number
    readonly fetchedAt: number
    readonly status: ContentStatus
    readonly content: string
    readonly baseUrl: string // Added: to hold base url for future processing
    readonly url: string // Added: To save url after redirection of baseUrl, can be nil if there is no redirection
    readonly errors: string[]
    readonly retryCounter: number
    readonly nextRetryAt: number

    constructor(
        id: number,
        id_configuration: number,
        relatedNewsId: number,
        relatedTweetId: number,
        relatedCreateAt: number,
        fetchedAt: number,
        status: ContentStatus,
        content: string,
        baseUrl: string,
        url: string | undefined,
        errors: string[],
        retryCounter: number,
        nextRetryAt: number
    ) {
        this.id = id;
        this.id_configuration = id_configuration;
        this.relatedNewsId = relatedNewsId;
        this.relatedTweetId = relatedTweetId;
        this.relatedCreateAt = relatedCreateAt;
        this.fetchedAt = fetchedAt;
        this.status = status;
        this.content = content;
        this.baseUrl = baseUrl;
        if (url) {
            this.url = url;
        } else {
            this.url = ""
        }
        this.errors = errors;
        this.retryCounter = retryCounter
        this.nextRetryAt = nextRetryAt
    }

    static createFromObject(obj: any): Content {
        const id = obj.id;
        const id_configuration = obj.id_configuration;
        const relatedNewsId = obj.relatedNewsId;
        const relatedTweetId = obj.relatedTweetId;
        const relatedCreateAt = obj.relatedCreateAt;
        const fetchedAt = obj.fetchedAt;
        const status = obj.status;
        const content = obj.content;
        const baseUrl = obj.baseUrl;
        const url = obj.url;
        const errors = obj.errors;
        const retryCounter = obj.retryCounter;
        const nextRetryAt = obj.nextRetryAt;
        return new Content(id, id_configuration, relatedNewsId, relatedTweetId, relatedCreateAt, fetchedAt, status, content, baseUrl, url, errors, retryCounter, nextRetryAt);
    }
}

export enum ContentStatus { error, done, retry };