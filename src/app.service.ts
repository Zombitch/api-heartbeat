import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';
import { HttpService } from '@nestjs/axios';
import { throwError, forkJoin, Observable } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  check(config: {}){
    const data = readFileSync(join(__dirname, '../public/'+config+'.json'));
    const jsonData = data.toJSON();
    let dashboard = {};
    let promises = [];

    const observableRequests: Observable<{}> = forkJoin(jsonData['entries'].map(entry => entry.method == 'GET' ? this.httpService.get(entry.url): throwError(() => "Verbe HTTP non géré")));

    observableRequests.subscribe()

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

    return Promise.all(promises).then(data => dashboard);
  }

  private buildDashboard(entry, result, succeed): {} {
    return {url: entry.url, method: entry.method, result: result, succeed: succeed};
  }
}
