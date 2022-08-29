import * as codepipeline from "@aws-cdk/aws-codepipeline"

export interface codePipelineOutputs {
    prefix?: string
    pipeline: codepipeline.Pipeline
}