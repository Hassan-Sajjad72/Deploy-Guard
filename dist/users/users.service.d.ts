import { Repository } from "typeorm";
import { User, UserRole } from "./user.entity";
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findOrCreate(githubData: {
        githubId: string;
        name: string;
        email: string;
        image: string;
        login: string;
    }): Promise<{
        user: User;
        isNewUser: boolean;
    }>;
    createWithPassword(data: {
        name: string;
        email: string;
        passwordHash: string;
    }): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByEmailWithPassword(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    findAll(): Promise<User[]>;
    updateRole(id: number, role: UserRole): Promise<User>;
    markLoggedIn(user: User): Promise<User>;
}
