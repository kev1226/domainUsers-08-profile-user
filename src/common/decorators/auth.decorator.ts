import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '../../common/enums/rol.enum';
import { AuthGuard } from '../guard/auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guard/roles.guard';

export function Auth(...roles: Role[]) {
  return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard));
}
