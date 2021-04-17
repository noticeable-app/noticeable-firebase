import { app, apps, credential, initializeApp } from 'firebase-admin';

export class Firebase {
    static init(projectId?: string, serviceAccountPath?: string): app.App {
        if (projectId) {
            const firebaseApp = this.findExistingFirebaseApp(projectId);
            if (firebaseApp) {
                console.warn(`App '${projectId}' is already initialized, will use existing instance`);
                return firebaseApp;
            }

            const databaseUrl = `https://${projectId}.firebaseio.com`;

            return initializeApp(
                serviceAccountPath
                    ? {
                          credential: credential.cert(serviceAccountPath),
                          databaseURL: databaseUrl,
                      }
                    : { databaseURL: databaseUrl },
                projectId,
            );
        } else {
            const firebaseApp = this.findExistingFirebaseApp(projectId);
            if (firebaseApp) {
                console.warn(`Default app is already initialized, will use existing instance`);
                return firebaseApp;
            }

            return initializeApp();
        }
    }

    static findExistingFirebaseApp(projectId: string): app.App | undefined {
        return apps.find((firebaseApp) => firebaseApp.options.projectId === projectId);
    }
}
