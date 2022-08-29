import * as cdk from "@aws-cdk/core";
import * as s3aws from "@aws-cdk/aws-s3"
import {HttpMethods} from "@aws-cdk/aws-s3"
import {s3Inputs} from "./constructs_s3_inputs";
import {s3Outputs} from "./constructs_s3_outputs";


export class s3 extends cdk.Construct{

    private readonly _outputs: s3Outputs
    private readonly inputs: s3Inputs
    private readonly scope: cdk.Construct


    get outputs(): s3Outputs {
        return this._outputs;
    }

    constructor(scope: cdk.Construct, id: string, properties: s3Inputs) {
        super(scope, id);

        this.scope = scope
        this.inputs = properties
        this._outputs = {} as s3Outputs
        this._outputs.s3Buckets = []

        this.
            createBuckets()
    }

    private createBuckets(): s3 {
        for (let bucketName of this.inputs.metadata.names) {
            this.createBucket(bucketName)
        }
        return this
    }

    private createBucket(bucketName: string): s3 {
        // console.log(bucketName)
        this._outputs.s3Buckets.push(
            new s3aws.Bucket(this.scope, bucketName, {
                    bucketName: `${bucketName}-${this.inputs.metadata.accountId}`,
                    blockPublicAccess: {
                        blockPublicAcls: true,
                        blockPublicPolicy: true,
                        ignorePublicAcls: true,
                        restrictPublicBuckets: true
                    },
                    cors: [
                        {
                            allowedMethods: [
                                HttpMethods.HEAD,
                                HttpMethods.GET,
                                HttpMethods.PUT,
                                HttpMethods.POST
                            ],
                            allowedHeaders: [
                                "*"
                            ],
                            exposedHeaders: [
                                "x-amz-server-side-encryption",
                                "x-amz-meta-originalname",
                                "x-amz-request-id",
                                "x-amz-version-id",
                                "x-amz-id-2"
                            ],
                            maxAge: 3200,
                            allowedOrigins: this.inputs.spec.cors.allowedOrigins
                        }
                    ]
                }
            )
        )
    return this
    }
}