export declare class RepositoryWorkspaceService {
    cloneRepository(input: {
        repositoryUrl: string;
        targetBranch: string;
    }): Promise<{
        workspacePath: string;
        commitSha: string | null;
    }>;
    cleanup(workspacePath: string): Promise<void>;
    private validateRepositoryUrl;
}
