import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  root(): {} {
    this.appService.check('config').subscribe(data => {
      console.log(data);
    })
    return { message: 'lo'};
  }
}
