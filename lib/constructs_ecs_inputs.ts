import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as alb from "@aws-cdk/aws-elasticloadbalancingv2"

export interface ecsClusterInputs {
    prefix?: string
    metadata: {
        name: string
    }
    spec: {
        ecs: {
            resources: {
                memoryLimitMiB: number,
                cpuLimit: number
            },
            network: {
                port: number,
                protocol: ecs.Protocol
            },
            autoscaling: {
                minCapacity: number,
                maxCapacity: number,
                cpuUtilizationPercentageThreshold: number,
                memoryUtilizationPercentageThreshold: number
            }
        },
        alb: {
            self: alb.ApplicationLoadBalancer,
            listenerSettings: {
                hostHeadersCondition: string[],
                pathPatternsCondition: string[],
                priority: number,
                healthCheck: {
                    interval: number,
                    path: string,
                    timeout: number
                },
                protocol: alb.ApplicationProtocol
            }
        },
        vpc: {
            self: ec2.Vpc
        }
    }
}