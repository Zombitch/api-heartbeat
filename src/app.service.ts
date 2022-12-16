import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';
import { HttpService } from '@nestjs/axios';
import { throwError, forkJoin, Observable, of, zip, map } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  check(config: string): Observable<{}>{
    const data = readFileSync(join(__dirname, '../public/'+config+'.json')).toString('utf8');
    const jsonData = JSON.parse(data);
    let dashboard = {};
    //let promises = [];
    
    const entries = of(jsonData['entries']);
    const observableRequestList: Observable<{}> = forkJoin(jsonData['entries'].map(entry => entry.method == 'GET' ? this.httpService.get(entry.url): throwError(() => "Verbe HTTP non géré")));

    const observableResult = new Observable((subscriber) => {
      zip(entries, observableRequestList).pipe(
        map(([entry, request]) => ({ entry, request }))
      )
      .subscribe({
        next: data => dashboard[data.entry['id']] = this.buildDashboard(data.entry, data.request, false),
        complete: () => {
          subscriber.next(dashboard);
          subscriber.complete();
        }
      })
    });

    /*jsonData['entries'].forEach(entry => {
      const  getObservable = this.httpService.get(entry.url, {method:entry.method});//.catch(err => dashboard[entry.id] = this.buildDashboard(entry, err, false));
      const toJsonPromise = fetchPromise.then(response => response.json ? response.json() : response).catch(err => console.log(err));

      toJsonPromise.then(jsonResponse => {
        if(jsonResponse.succeed === false || jsonResponse.status) dashboard[entry.id] = this.buildDashboard(entry, jsonResponse, false);
        else dashboard[entry.id] = this.buildDashboard(entry, jsonResponse, true);
      })
      .catch(err => dashboard[entry.id] = this.buildDashboard(entry, err, false));
      
      promises.push(fetchPromise);
      promises.push(toJsonPromise);
    });*/

    return observableResult;
  }

  private buildDashboard(entry, result, succeed): {} {
    return {url: entry.url, method: entry.method, result: result, succeed: succeed};
  }
}
