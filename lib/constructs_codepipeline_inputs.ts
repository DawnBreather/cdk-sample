import * as ec2 from "@aws-cdk/aws-ec2"
import * as ecs from "@aws-cdk/aws-ecs"

export interface codePipelineInputs {
    prefix?: string
    spec: {
        git: {
            codestarConnectionArn: string
            gitHubUsername: string
            gitHubRepository: string
            gitBranch: string
            gitToken: string
        },
        ecs: {
            service: ecs.FargateService
        },
        vpc: ec2.Vpc,
        // codeBuild: {
        //     environmentVariables: {
        //         gitBranch
        //     }
        // }
    }
}