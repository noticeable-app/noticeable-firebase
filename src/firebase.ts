import { App, cert, getApps, initializeApp } from 'firebase-admin/app';

export class Firebase {
    static init(projectId?: string, serviceAccountPath?: string): App {
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
                          credential: cert(serviceAccountPath),
                          databaseURL: databaseUrl,
                          projectId: projectId,
                      }
                    : { databaseURL: databaseUrl, projectId: projectId },
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

    static findExistingFirebaseApp(appName: string = '[DEFAULT]'): App | undefined {
        return getApps().find((firebaseApp) => firebaseApp.name === appName);
    }
}
