import { Firestore as FirebaseDb, Query, Timestamp } from 'firebase-admin/firestore';

export class Firestore {
    public static deleteCollection(db: FirebaseDb, collectionPath: string, batchSize = 500): Promise<number> {
        const collectionRef = db.collection(collectionPath);
        const query = collectionRef.orderBy('__name__').limit(batchSize);

        return Firestore.deleteQueryBatch(db, query, batchSize);
    }

    public static async deleteQueryBatch(db: FirebaseDb, query: Query, batchSize = 500): Promise<number> {
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

    private readonly db: FirebaseDb;

    private readonly name: string;

    constructor(db: FirebaseDb, name: string, collectionPath = 'locks') {
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
