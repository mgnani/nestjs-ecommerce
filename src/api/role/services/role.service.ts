import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/database/entities/role.entity';
import { AssignRoleDto } from '../dto/role.dto';
import { UserService } from 'src/api/user/services/user.service';
import { errorMessages } from 'src/errors/custom';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    private readonly userService: UserService,
  ) {}

  async assignRoleToUser(data: AssignRoleDto) {
    const user = await this.userService.findById(data.userId, { roles: true });
    
    const newRoles: Role[] = [];
    for (let i = 1; i <= data.roleId; i++) {
      const role = await this.findById(i);
      newRoles.push(role);
    }
    
    user.roles = newRoles;
    
    return this.userService.save(user);
  }

  async findById(roleId: number) {
    const role = await this.rolesRepository.findOne({
      where: {
        id: roleId,
      },
    });
    if (!role) {
      throw new NotFoundException(errorMessages.role.notFound);
    }
    return role;
  }
}