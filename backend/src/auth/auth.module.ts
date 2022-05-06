import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from './entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { TwoFAService } from './twoFA/twoFA.service';
import { TwoFAController } from './twoFA/twoFA.controller';
import { JwtRefreshStrategy } from './strategies/jwtRefresh.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([User]),
    HttpModule,
  ],
  providers: [AuthService, JwtStrategy, TwoFAService, JwtRefreshStrategy],
  controllers: [AuthController, TwoFAController],
  exports: [JwtStrategy, PassportModule, TypeOrmModule, JwtModule]
})
export class AuthModule {}
