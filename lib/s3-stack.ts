import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import {ecsCluster} from "./constructs_ecs";
import * as alb from "@aws-cdk/aws-elasticloadbalancingv2";
import * as ecs from "@aws-cdk/aws-ecs";
import {codePipeline} from "./constructs_codepipeline";
import {s3} from "./constructs_s3";
import {ecsClusterInputs} from "./constructs_ecs_inputs";
import {codePipelineInputs} from "./constructs_codepipeline_inputs";

interface s3BucketsProperties extends cdk.StackProps{
    s3BucketsNames: string[]
    allowedOrigins: string[]
    awsAccountId: string
}

export class S3BucketsStack extends cdk.Stack {

    private inputs: s3BucketsProperties

    constructor(scope: cdk.Construct, id: string, inputs: s3BucketsProperties) {
        super(scope, id, inputs);

        this.inputs = inputs

        this.createS3Buckets()

    }

    private createS3Buckets(){
        new s3(this, "s3-super", {
            metadata: {accountId: this.inputs.awsAccountId, names: this.inputs.s3BucketsNames}, spec: {cors: {allowedOrigins: this.inputs.allowedOrigins}}
        })
    }
}