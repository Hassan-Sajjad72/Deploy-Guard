"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findOrCreate(githubData) {
        let user = await this.userRepository.findOne({
            where: { githubId: githubData.githubId },
        });
        let isNewUser = false;
        if (!user && githubData.email) {
            user = await this.findByEmail(githubData.email);
        }
        if (!user) {
            isNewUser = true;
            user = this.userRepository.create({
                githubId: githubData.githubId,
                name: githubData.name,
                email: githubData.email,
                image: githubData.image,
                githubLogin: githubData.login,
                lastLoginAt: new Date(),
            });
        }
        else {
            user.githubId = githubData.githubId;
            user.name = githubData.name;
            user.email = githubData.email;
            user.image = githubData.image;
            user.githubLogin = githubData.login;
            user.lastLoginAt = new Date();
        }
        const savedUser = await this.userRepository.save(user);
        return { user: savedUser, isNewUser };
    }
    async createWithPassword(data) {
        const existingUser = await this.findByEmail(data.email);
        if (existingUser) {
            throw new common_1.ConflictException("Email is already registered");
        }
        const user = this.userRepository.create({
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash,
            lastLoginAt: new Date(),
        });
        return this.userRepository.save(user);
    }
    async findByEmail(email) {
        return this.userRepository
            .createQueryBuilder("user")
            .where("LOWER(user.email) = LOWER(:email)", { email })
            .getOne();
    }
    async findByEmailWithPassword(email) {
        return this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.passwordHash")
            .where("LOWER(user.email) = LOWER(:email)", { email })
            .getOne();
    }
    async findById(id) {
        return this.userRepository.findOne({ where: { id } });
    }
    async findAll() {
        return this.userRepository.find({
            order: { createdAt: "DESC" },
        });
    }
    async updateRole(id, role) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        user.role = role;
        return this.userRepository.save(user);
    }
    async markLoggedIn(user) {
        user.lastLoginAt = new Date();
        return this.userRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map