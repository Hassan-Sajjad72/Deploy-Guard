export declare class DockerBuildService {
    isDockerAvailable(): Promise<boolean>;
    buildImage(input: {
        workspacePath: string;
        imageName: string;
        imageTag: string;
    }): Promise<void>;
    tagImage(input: {
        localImageName: string;
        imageTag: string;
        ecrImageUri: string;
    }): Promise<void>;
    pushImage(ecrImageUri: string): Promise<void>;
}
