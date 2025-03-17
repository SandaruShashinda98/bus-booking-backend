/* The `AppInitService` class in TypeScript provides methods to manage failed modules, clear the list
of failed modules, and restart the application. */
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { Injectable } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AppInitService {
  private readonly _failedModules = new BehaviorSubject<string[]>([]);

  get failedModules() {
    return this._failedModules.getValue();
  }

  addNewFailedModule(moduleName: DB_COLLECTION_NAMES) {
    this._failedModules.next([...this._failedModules.value, moduleName]);
  }

  clearFailedModules() {
    this._failedModules.next([]);
  }

  restartTheApp() {
    try {
      setTimeout(function () {
        // Listen for the 'exit' event.
        process.on('exit', function () {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require('child_process').spawn(process.argv.shift(), process.argv, {
            cwd: process.cwd(),
            detached: true,
            stdio: 'inherit',
          });
        });
        process.exit(1);
      }, 5000);
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
