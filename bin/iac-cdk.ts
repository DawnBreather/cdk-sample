#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {VpcStack} from '../lib/vpc-stack';
import {EcsClusterStack} from "../lib/ecs-stack";
import {S3BucketsStack} from "../lib/s3-stack";

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'VpcStack', {
});

const s3Stack = new S3BucketsStack(app, 'S3BucketsStack', {
    allowedOrigins: ["*.sample.vok-works.com"], awsAccountId: "123456789123", s3BucketsNames: ["sample-cards", "sample-cx-task", "sample-mfp-logos", "sample-requests-notes", "sample-requests-rx", "sample-scan-reports", "sample-tasks"]
})

const ecsClusterStack = new EcsClusterStack(app, 'SampleApiEcsClusterStack', {
    vpc: vpcStack.vpc.outputs.vpc,
    alb: {
        alb: vpcStack.applicationLoadBalancer.outputs.alb,
        hostHeaders: ["admin-api.sample.vok-works.com"],
        healthChecksPath: "/health"
    },
    git: {
        codestarConnectionArn: "arn:aws:codestar-connections:us-east-1:123456789123:connection/b307e88a-fd64-4445-8419-e3507bc5e758",
        gitHubRepository: "sample-admin",
        gitHubUsername: "DawnBreather",
        gitBranch: "dev",
        gitToken: "test"
    }
})
