import {ecsClusterInputs} from "./constructs_ecs_inputs";
import {ecsClusterOutputs} from "./constructs_ecs_outputs";

import * as cdk from "@aws-cdk/core";
import * as ecs from "@aws-cdk/aws-ecs"
import * as ecr from "@aws-cdk/aws-ecr";
import * as alb from "@aws-cdk/aws-elasticloadbalancingv2"
import {LogDriver} from "@aws-cdk/aws-ecs";



export class ecsCluster extends cdk.Construct {

    private readonly _outputs: ecsClusterOutputs
    private inputs: ecsClusterInputs
    private readonly scope: cdk.Construct


    get outputs(): ecsClusterOutputs {
        return this._outputs;
    }

    constructor(scope: cdk.Construct, id: string, properties: ecsClusterInputs) {
        super(scope, id)

        this.scope = scope
        this.inputs = properties
        this._outputs = {} as ecsClusterOutputs

        this.
            createEcrRepository().
            createEcsCluster().
            createEcsFargateTaskDefinition().
            createEcsContainerDefinition().
            createEcsPortMappings().
            createEcsFargateService().
            configureEcsFargateServiceAutoscaling().
            createAlbListener().
            createAlbTargetGroup()

    }

    private createEcrRepository(): ecsCluster{
        this._outputs.ecrRepository = new ecr.Repository(this.scope, "ecrRepository", {
            repositoryName: this.inputs.metadata.name
        })
        return this
    }

    private createEcsCluster(): ecsCluster {
        this._outputs.cluster = new ecs.Cluster(this.scope, "ecsCluster", {
            vpc: this.inputs.spec.vpc.self,
            clusterName: this.inputs.metadata.name
        })
        return this
    }

    private createEcsFargateTaskDefinition(): ecsCluster{
        this._outputs.fargateTaskDefinition = new ecs.FargateTaskDefinition(this.scope, "ecsTaskDefinition")
        return this
    }

    private createEcsContainerDefinition(): ecsCluster{
        this._outputs.containerDefinition = this._outputs.fargateTaskDefinition.addContainer("ecsContainerDefinition", {
            image: ecs.ContainerImage.fromRegistry("dawnbreather/nginx", {
            }), // ecs.ContainerImage.fromEcrRepository(this._outputs.ecrRepository, ""),
            memoryLimitMiB: this.inputs.spec.ecs.resources.memoryLimitMiB,
            cpu: this.inputs.spec.ecs.resources.cpuLimit,
            containerName: this.inputs.metadata.name,
            logging: LogDriver.awsLogs({streamPrefix: this.inputs.metadata.name})
        })

        return this
    }

    private createEcsPortMappings(): ecsCluster{
        this._outputs.containerDefinition.addPortMappings({
            containerPort: this.inputs.spec.ecs.network.port,
            hostPort: this.inputs.spec.ecs.network.port,
            protocol: this.inputs.spec.ecs.network.protocol
        })

        return this
    }

    private createEcsFargateService(): ecsCluster{
        this._outputs.fargateService = new ecs.FargateService(this.scope, "ecsFargateService", {
            taskDefinition: this._outputs.fargateTaskDefinition,
            cluster: this._outputs.cluster,
            enableExecuteCommand: true
        })

        return this
    }

    private configureEcsFargateServiceAutoscaling(): ecsCluster{
        const scalableTarget = this._outputs.fargateService.autoScaleTaskCount({
            minCapacity: this.inputs.spec.ecs.autoscaling.minCapacity,
            maxCapacity: this.inputs.spec.ecs.autoscaling.maxCapacity
        })

        scalableTarget.scaleOnCpuUtilization('EcsCpuScaling', {
            targetUtilizationPercent: this.inputs.spec.ecs.autoscaling.cpuUtilizationPercentageThreshold,
        })

        scalableTarget.scaleOnMemoryUtilization('EcsMemoryScaling', {
            targetUtilizationPercent: this.inputs.spec.ecs.autoscaling.memoryUtilizationPercentageThreshold,
        })

        return this
    }

    private createAlbListener(): ecsCluster {
        this._outputs.albListener = this.inputs.spec.alb.self.addListener(
            "albListener",
            {
                port: this.inputs.spec.ecs.network.port,
                protocol: this.inputs.spec.alb.listenerSettings.protocol,
                open: true,
                defaultAction: alb.ListenerAction.fixedResponse(200, {messageBody: 'This is the ALB Default Action'})
            }
        )

        return this
    }

    private createAlbTargetGroup(): ecsCluster{
        this._outputs.albTargetGroup = this._outputs.albListener.addTargets("albTargetGroup", {
            targetGroupName: this.inputs.metadata.name,

            port: this.inputs.spec.ecs.network.port,
            protocol: this.inputs.spec.alb.listenerSettings.protocol,

            conditions: [
                alb.ListenerCondition.hostHeaders(this.inputs.spec.alb.listenerSettings.hostHeadersCondition),
                alb.ListenerCondition.pathPatterns(this.inputs.spec.alb.listenerSettings.pathPatternsCondition)
            ],

            targets: [this._outputs.fargateService.loadBalancerTarget({
                containerName: this.inputs.metadata.name,
                containerPort: this.inputs.spec.ecs.network.port
            })],

            priority: this.inputs.spec.alb.listenerSettings.priority,

            healthCheck: {
                interval: cdk.Duration.seconds(this.inputs.spec.alb.listenerSettings.healthCheck.interval),
                path: this.inputs.spec.alb.listenerSettings.healthCheck.path,
                timeout: cdk.Duration.seconds(this.inputs.spec.alb.listenerSettings.healthCheck.timeout)
            }
        })

        return this
    }
}


