import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '../common/enums/rol.enum';
import { Auth } from '../common/decorators/auth.decorator';
import { ActiveUser } from 'src/common/decorators/active-user-decorator';
import { UserActiveInterface } from 'src/common/interface/user-active.interface';
import { AuthGuard } from 'src/common/guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  // @Auth(Role.USER)
  @UseGuards(AuthGuard)
  profile(@ActiveUser() user: any) {
    return user;
  }
}
