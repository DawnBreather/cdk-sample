import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import {ecsCluster} from "./constructs_ecs";
import * as alb from "@aws-cdk/aws-elasticloadbalancingv2";
import * as ecs from "@aws-cdk/aws-ecs";
import {codePipeline} from "./constructs_codepipeline";
import {s3} from "./constructs_s3";
import {ecsClusterInputs} from "./constructs_ecs_inputs";
import {codePipelineInputs} from "./constructs_codepipeline_inputs";

interface EcsClusterProperties extends cdk.StackProps{
    vpc: ec2.Vpc,
    git: {
        codestarConnectionArn: string,
        gitHubRepository: string,
        gitHubUsername: string,
        gitBranch: string,
        gitToken: string
    },
    alb: {
        alb: alb.ApplicationLoadBalancer,
        hostHeaders: string[],
        healthChecksPath: string
    }
}

export class EcsClusterStack extends cdk.Stack {

    private inputs: EcsClusterProperties

    constructor(scope: cdk.Construct, id: string, inputs: EcsClusterProperties) {
        super(scope, id, inputs);

        this.inputs = inputs

        this.createClusterWithPipeline()

    }

    private createClusterWithPipeline(){
        const cluster = new ecsCluster(this, this.inputs.git.gitHubRepository, this.compileEcsClusterInputs())
        new codePipeline(this, "pipeline", this.compileCodePipelineInputs(cluster))
    }

    private compileCodePipelineInputs(cluster: ecsCluster): codePipelineInputs {
        return {
            spec: {
                ecs: {service: cluster.outputs.fargateService},
                git: this.inputs.git,
                vpc: this.inputs.vpc
            }
        }
    }

    private compileEcsClusterInputs(): ecsClusterInputs {
        return {
            metadata: {
                name: this.inputs.git.gitHubRepository
            },
            spec: {
                alb: {
                    listenerSettings: {
                        healthCheck: {interval: 60, path: this.inputs.alb.healthChecksPath, timeout: 5},
                        hostHeadersCondition: this.inputs.alb.hostHeaders,
                        pathPatternsCondition: ["/"],
                        priority: 1,
                        protocol: alb.ApplicationProtocol.HTTP
                    }, self: this.inputs.alb.alb
                },

                ecs: {
                    resources: {
                        cpuLimit: 256,
                        memoryLimitMiB: 512
                    },
                    network: {
                        port: 80,
                        protocol: ecs.Protocol.TCP
                    },
                    autoscaling: {
                        cpuUtilizationPercentageThreshold: 50,
                        memoryUtilizationPercentageThreshold: 50,
                        maxCapacity: 10,
                        minCapacity: 1
                    }
                }, vpc: {self: this.inputs.vpc}
            }
        }
    }
}