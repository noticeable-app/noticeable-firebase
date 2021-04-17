import { firestore } from 'firebase-admin';

export class Firestore {
    public static deleteCollection(db: firestore.Firestore, collectionPath: string, batchSize = 500): Promise<number> {
        const collectionRef = db.collection(collectionPath);
        const query = collectionRef.orderBy('__name__').limit(batchSize);

        return Firestore.deleteQueryBatch(db, query, batchSize);
    }

    public static async deleteQueryBatch(
        db: firestore.Firestore,
        query: firestore.Query,
        batchSize = 500,
    ): Promise<number> {
        let deleteCount = 0;

        while (true) {
            const querySnapshot = await query.limit(batchSize).get();

            deleteCount += querySnapshot.size;

            if (querySnapshot.size === 0) {
                return deleteCount;
            }

            const batch = db.batch();

            querySnapshot.docs.forEach((documentSnapshot) => {
                batch.delete(documentSnapshot.ref);
            });

            await batch.commit();
        }
    }
}

export class FirestoreLock {
    private readonly collectionPath: string;

    private readonly db: firestore.Firestore;

    private readonly name: string;

    constructor(db: firestore.Firestore, name: string, collectionPath = 'locks') {
        this.collectionPath = collectionPath;
        this.db = db;
        this.name = name;
    }

    public async acquire(): Promise<boolean> {
        try {
            await this.db.collection(this.collectionPath).doc(this.name).create({
                creationTime: firestore.Timestamp.now(),
            });

            return true;
        } catch (error) {
            return false;
        }
    }

    public async release(): Promise<boolean> {
        try {
            await this.db.collection(this.collectionPath).doc(this.name).delete();
            return true;
        } catch (error) {
            console.error(`Error while releasing lock ${this.collectionPath}/${this.name}`, error);
            return false;
        }
    }
}
