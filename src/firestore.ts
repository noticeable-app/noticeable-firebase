import { Firestore as FirestoreDatabase, Query, Timestamp } from 'firebase-admin/firestore';

export class Firestore {
    public static deleteCollection(db: FirestoreDatabase, collectionPath: string, batchSize = 500): Promise<number> {
        const collectionRef = db.collection(collectionPath);
        const query = collectionRef.orderBy('__name__').limit(batchSize);

        return Firestore.deleteQueryBatch(db, query, batchSize);
    }

    public static async deleteQueryBatch(db: FirestoreDatabase, query: Query, batchSize = 500): Promise<number> {
        let deleteCount = 0;
        let size = 0;

        do {
            const querySnapshot = await query.limit(batchSize).get();
            size = querySnapshot.size;
            deleteCount += size;

            if (size === 0) {
                break;
            }

            const batch = db.batch();

            querySnapshot.docs.forEach((documentSnapshot) => {
                batch.delete(documentSnapshot.ref);
            });

            await batch.commit();
        } while (size > 0);

        return deleteCount;
    }

}

export class FirestoreLock {
    private readonly collectionPath: string;

    private readonly db: FirestoreDatabase;

    private readonly name: string;

    constructor(db: FirestoreDatabase, name: string, collectionPath = 'locks') {
        this.collectionPath = collectionPath;
        this.db = db;
        this.name = name;
    }

    public async acquire(): Promise<boolean> {
        try {
            await this.db.collection(this.collectionPath).doc(this.name).create({
                creationTime: Timestamp.now(),
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
