import * as ec2 from "@aws-cdk/aws-ec2"

export interface s3Inputs {
    prefix?: string
    metadata: {
        names: string[]
        accountId: string
    }
    spec: {
        cors: {
            allowedOrigins: string[]
        }
    }
}