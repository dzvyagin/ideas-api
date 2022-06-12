import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { UserDTO } from './user.dto';
import { UserService } from './user.service';
import { ValidationPipe } from './../shared/validation.pipe';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('api/users')
  showAllUsers() {
    return this.userService.showAll();
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  login(@Body() data: UserDTO) {
    return this.userService.login(data);
  }

  @Post('register')
  register(@Body() data: UserDTO) {
    return this.userService.register(data);
  }
}
