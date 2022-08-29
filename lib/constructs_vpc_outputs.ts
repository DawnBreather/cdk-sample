
import * as ec2 from "@aws-cdk/aws-ec2"

export interface vpcOutputs {
    prefix?: string
    vpc: ec2.Vpc
}