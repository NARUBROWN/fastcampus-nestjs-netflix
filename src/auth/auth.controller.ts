import { Controller, Post, Headers, Head, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { Public } from './decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  registerUser(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Public()
  @Post('login')
  loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }

  @Post('token/access')
  async retateAccessToken(@Request() req: any) {
    return {
      accessToken: await this.authService.issueToken(req.user, false)
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
