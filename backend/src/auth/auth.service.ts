import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ChangeEmailDto,
  ChangePasswordDto,
} from './dto/change-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const defaultStatut = await this.prisma.statut.findFirst({
      where: { nom: 'Salarié' },
    });

    const account = await this.prisma.account.create({
      data: {
        email: dto.email,
        passwordHash,
        dossier: {
          create: {
            personnes: {
              create: {
                nom: dto.email.split('@')[0],
                prenom: '',
                role: 'candidat',
                statutId: defaultStatut?.id ?? 'statut-salarie',
                typeLogement: 'locataire',
              },
            },
          },
        },
      },
    });

    return this.generateToken(account);
  }

  async login(dto: LoginDto) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });
    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, account.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(account);
  }

  async me(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true, email: true },
    });
    return account;
  }

  async changeEmail(accountId: string, dto: ChangeEmailDto) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    const isValid = await bcrypt.compare(dto.password, account.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const existing = await this.prisma.account.findUnique({
      where: { email: dto.newEmail },
    });
    if (existing && existing.id !== accountId) {
      throw new ConflictException('Email already in use');
    }

    await this.prisma.account.update({
      where: { id: accountId },
      data: { email: dto.newEmail },
    });

    return { email: dto.newEmail };
  }

  async changePassword(accountId: string, dto: ChangePasswordDto) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    const isValid = await bcrypt.compare(
      dto.currentPassword,
      account.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.account.update({
      where: { id: accountId },
      data: { passwordHash },
    });

    return { message: 'Password updated' };
  }

  private generateToken(account: { id: string; email: string }) {
    return {
      accessToken: this.jwtService.sign({
        sub: account.id,
        email: account.email,
      }),
      account: { id: account.id, email: account.email },
    };
  }
}
