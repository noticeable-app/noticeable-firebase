import { app, apps, credential, initializeApp } from 'firebase-admin';

export class Firebase {
    static init(projectId?: string): app.App {
        if (projectId) {
            const firebaseApp = this.findExistingFirebaseApp(projectId);
            if (firebaseApp) {
                console.warn(`App '${projectId}' is already initialized, will use existing instance`);
                return firebaseApp;
            }

            return initializeApp(
                {
                    credential: credential.cert(`${process.cwd()}/keyfiles/${projectId}.json`),
                    databaseURL: `https://${projectId}.firebaseio.com`,
                },
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

    static findExistingFirebaseApp(appName: string = '[DEFAULT]'): app.App {
        return apps.find((firebaseApp) => firebaseApp.name === appName);
    }
}
