import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader } from '@nestjs/swagger';
import { AppService } from './app.service';
import { loginInfo } from './auth/auth.input';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService  
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiBody({description: "로그인", type: loginInfo})
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiHeader({
    name: "Authorization",
    description: "jwt token",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log("/profile: ");
    console.log("- headers:");
    console.log(req.headers);
    console.log("");
    console.log("- params:");
    console.log(req.params);
    console.log("");
    console.log("- body:");
    console.log(req.body);
    console.log("");
    console.log("- query");
    console.log(req.query);
    return req.user;
  }
}
