
import * as s3 from "@aws-cdk/aws-s3"

export interface s3Outputs {
    prefix?: string
    s3Buckets: s3.Bucket[]
}