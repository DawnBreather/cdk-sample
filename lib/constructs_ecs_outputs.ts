import * as ecr from "@aws-cdk/aws-ecr";
import * as ecs from "@aws-cdk/aws-ecs";
import * as alb from "@aws-cdk/aws-elasticloadbalancingv2";

export interface ecsClusterOutputs {
    ecrRepository: ecr.Repository
    cluster: ecs.Cluster
    fargateTaskDefinition: ecs.FargateTaskDefinition
    containerDefinition: ecs.ContainerDefinition
    fargateService: ecs.FargateService
    albListener: alb.ApplicationListener
    albTargetGroup: alb.ApplicationTargetGroup
}