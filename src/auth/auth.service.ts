import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { envVariables } from 'src/commons/entites/const/env.const';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {}

    parseBasicToken(rawToken: string) {
        const basicSplit = rawToken.split(' ');

        if (basicSplit.length !== 2) {
            throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
        }

        const [basic, token] = basicSplit;

        if (basic.toLowerCase() !== 'basic') {
            throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
        }

        const decoded = Buffer.from(token, 'base64').toString('utf-8');

        const tokenSplit = decoded.split(':');

        if (tokenSplit.length !== 2) {
            throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
        }

        const [email, password] = tokenSplit;

        return  {
            email,
            password
        }
    }

    async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
        const basicSplit = rawToken.split(' ');

        if (basicSplit.length !== 2) {
            throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
        }

        const [bearer, token] = basicSplit;

        if (bearer.toLowerCase() !== 'bearer') {
            throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
            secret: this.configService.getOrThrow<string>(isRefreshToken ? envVariables.refreshTokenSecret : envVariables.accessTokenSecret)
            
        });

        if(isRefreshToken) {
            if(payload.type !== 'refresh') {
                throw new BadRequestException('Refresh 토큰을 입력해주세요');
            } 
        } else {
            if (payload.type !== 'access') {
                throw new BadRequestException('Access 토큰을 입력해주세요');
            }
        }
        
        return payload;

        } catch(e) {
            throw new UnauthorizedException('토큰이 만료되었습니다.');
        }
    }

    async authenticate(email: string, password: string): Promise<User> {

        const user = await this.userRepository.findOne({
            where: {
                email
            }
        });

        if (!user) {
            throw new BadRequestException('잘못된 로그인 정보입니다.');
        }

        const passOk = await bcrypt.compare(password, user.password);

        if(!passOk) {
             throw new BadRequestException('잘못된 로그인 정보입니다.');
        }

        return user;
    }

    async register(rawToken: string) { 
        const {email, password} = this.parseBasicToken(rawToken);

        const user = await this.userRepository.findOne({
            where: {
                email
            }
        });

        if (user) {
            throw new BadRequestException('이미 가입된 이메일입니다.');
        }

        const HASH_ROUNDS = this.configService.get<string>(envVariables.hashRounds);

        if (!HASH_ROUNDS) {
            throw new InternalServerErrorException('HASH ROUNDS 값이 존재하지 않습니다.');
        }

        const HASH_ROUNDS_INT = parseInt(HASH_ROUNDS);

        const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS_INT);


        await this.userRepository.save({
           email,
           password : hashedPassword
        });

        return this.userRepository.findOne({
            where: {
                email
            }
        });
    }

    async issueToken(user: { id: number, role: Role }, isRefreshToken: boolean) {

        const refreshTokenSecret = this.configService.get<string>(envVariables.refreshTokenSecret);
        const accessTokenSecret = this.configService.get<string>(envVariables.accessTokenSecret);

        return this.jwtService.signAsync({
                sub: user.id,
                role: user.role,
                type: isRefreshToken ? 'refresh' : 'access' 
            }, {
                secret : isRefreshToken ? refreshTokenSecret : accessTokenSecret,
                expiresIn: isRefreshToken ? '24h' : 300
            });
    }

    async login(rawToken: string) {
        const {email, password} = this.parseBasicToken(rawToken);


        const user = await this.authenticate(email, password);

        

        return {
            refreshToken : await this.issueToken(user, true),
            accessToken : await this.issueToken(user, false)
        }
    }
}
