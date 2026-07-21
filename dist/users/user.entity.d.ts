export declare enum UserRole {
    ADMIN = "admin",
    DEVELOPER = "developer",
    READONLY = "readonly"
}
export declare class User {
    id: number;
    githubId: string;
    name: string;
    email: string;
    passwordHash: string;
    image: string;
    githubLogin: string;
    lastLoginAt: Date;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
