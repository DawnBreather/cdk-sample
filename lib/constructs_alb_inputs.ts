import * as ec2 from "@aws-cdk/aws-ec2"

export interface albInputs {
    prefix?: string
    spec?: {
        vpc: ec2.Vpc,
        internetFacing?: boolean
    }
}