import { Controller, Post, Headers, Head, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Post('login')
  loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }

  @Post('token/access')
  async retateAccessToken(@Headers('authorization') token: string) {
    const payload = await this.authService.parseBearerToken(token, true);

    return {
      accessToken: await this.authService.issueToken(payload, false)
    }
  }

  @Post('login/passport')
  @UseGuards(LocalAuthGuard)
  async loginUserPassport(@Request() req) {
    return {
      refreshToken : await this.authService.issueToken(req.user, true),
      accessToken : await this.authService.issueToken(req.user, false)
    }
  }

  
  @Get('private')
  @UseGuards(JwtAuthGuard)
  async private(@Request() req) {
    return req.user;
  }
}
