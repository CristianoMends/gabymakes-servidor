import { Controller, Get, Param, UseGuards, Request, Body, Put, NotFoundException, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ViewUserDto } from './dto/view-user-dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req): Promise<ViewUserDto> {
    const email = req.user.email;
    const user = await this.usersService.findOneByEmail(email);
    return new ViewUserDto(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ): Promise<Partial<User>> {
    if (req.user.userId !== id) {
      throw new NotFoundException('Você não tem permissão para atualizar este perfil.');
    }

    const updatedUser = await this.usersService.update(id, updateUserDto);

    if (!updatedUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }



    const { password, ...result } = updatedUser;
    return result;
  }
}