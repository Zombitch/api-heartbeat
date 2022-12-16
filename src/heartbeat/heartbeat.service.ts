import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';
import { HttpService } from '@nestjs/axios';
import { throwError, forkJoin, Observable, of, zip, map, catchError } from 'rxjs';
import { Dashboard } from 'src/models/dashboard';

@Injectable()
export class HeartbeatService {
    constructor(private readonly httpService: HttpService) {}

    check(config: string): Observable<{}>{
      const fileContent = readFileSync(join(__dirname, '../../public/'+config+'.json')).toString('utf8');
      const jsonContent = JSON.parse(fileContent);
      const requestToCheck = jsonContent['entries'];
      let dashboard = {};
      
      const requestToCheckObservable: Observable<any> = of(requestToCheck);
      const observableRequestList: Observable<any> = forkJoin(requestToCheck.map(entry => {
        if(entry.method == 'GET'){
          return this.httpService.get(entry.url).pipe(catchError(err => of(err)))
        } else {
          throwError(() => "Verbe HTTP non géré");
        } 
      }));
  
      const observableResult = new Observable((subscriber) => {
        zip(requestToCheckObservable, observableRequestList).pipe(
          map(([entry, requestRes]) => ({ entry, requestRes }))
        )
        .subscribe(combinedData => {
          const entryResult: [] = combinedData.entry;
          const requestResult: [] = combinedData.requestRes;
  
          entryResult.forEach((entry, index) => {
            if(requestResult[index]['code'] && (requestResult[index]['code'] == 'ENOTFOUND' || (requestResult[index]['code'] as string).includes('ERR'))){
              dashboard[entry['id'] as string] = this.buildDashboard(entry, requestResult[index], false);
            } else {
              dashboard[entry['id'] as string] = this.buildDashboard(entry, requestResult[index]['data'], true);
            }
          });
          
          subscriber.next(dashboard);
          subscriber.complete();
        })
      });
  
      return observableResult;
    }
  
    private buildDashboard(entry, result, succeed): Dashboard {
      return {url: entry.url, method: entry.method, result: result, succeed: succeed};
    }
}
