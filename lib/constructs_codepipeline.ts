import * as cdk from "@aws-cdk/core"
import * as codepipeline from "@aws-cdk/aws-codepipeline"
import * as codebuild from "@aws-cdk/aws-codebuild"
import {BuildEnvironmentVariableType, ComputeType, IProject, SourceConfig} from "@aws-cdk/aws-codebuild"
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions"
import {codePipelineOutputs} from "./constructs_codepipeline_outputs";
import {codePipelineInputs} from "./constructs_codepipeline_inputs";
import {Construct} from "constructs";


export class codePipeline extends cdk.Construct {

    private readonly _outputs: codePipelineOutputs
    private readonly inputs: codePipelineInputs
    private readonly scope: cdk.Construct

    constructor(scope: cdk.Construct, id: string, properties: codePipelineInputs) {
        super(scope, id);

        this.scope = scope
        this.inputs = properties
        this._outputs = {} as codePipelineOutputs

        this.createCodePipeline()
    }

    private createCodePipeline(): codePipeline {

        const sourcesArtifact = new codepipeline.Artifact()
        const postBuildArtifacts = new codepipeline.Artifact()

        this._outputs.pipeline = new codepipeline.Pipeline(this, "pipeline", {
            stages: [{
                stageName: "source",
                actions: [
                    new codepipeline_actions.CodeStarConnectionsSourceAction({
                        actionName: "source",
                        connectionArn: this.inputs.spec.git.codestarConnectionArn,
                        output: sourcesArtifact,
                        owner: this.inputs.spec.git.gitHubUsername,
                        repo: this.inputs.spec.git.gitHubRepository
                    }),
                ]
            },
                {
                    stageName: "build",
                    actions:[
                        new codepipeline_actions.CodeBuildAction({
                            actionName: "build",
                            input: sourcesArtifact,
                            project: this.createCodeBuildProject(),
                            outputs: [postBuildArtifacts]
                        }),
                    ]
                },
                {
                    stageName: "deploy",
                    actions: [
                        new codepipeline_actions.EcsDeployAction({
                            actionName: "deploy",
                            service: this.inputs.spec.ecs.service,
                            input: postBuildArtifacts
                        })
                    ]
                }
            ]
        })

        return this
    }

    private createCodeBuildProject(): codebuild.PipelineProject {
        return new codebuild.Project(this, "codebuild", {
            // buildSpec: codebuild.BuildSpec.fromSourceFilename(".devops/buildspec.yaml"),
            // buildSpec: codebuild.BuildSpec.from
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {
                        commands: [
                            'echo "hello"'
                        ]
                    }
                }
            }),
            environment: {
                computeType: ComputeType.SMALL,
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
                privileged: true,
                environmentVariables:
                    {
                        "GIT_BRANCH": plaintextEnvironmentVariable(this.inputs.spec.git.gitBranch),
                        "GIT_TOKEN": secretsManagerEnvironmentVariable(this.inputs.spec.git.gitToken)
                    }
            },
            vpc: this.inputs.spec.vpc,
            // source: codebuild.Source.gitHub({
            //     owner: this.inputs.spec.git.gitHubUsername,
            //     repo: this.inputs.spec.git.gitHubRepository,
            //     branchOrRef: ""
            // })
            // source: codebuild.Source.s3({bucket: undefined, path: ""})
        })
    }
}

function plaintextEnvironmentVariable(value: string): codebuild.BuildEnvironmentVariable{
    return {
        type: BuildEnvironmentVariableType.PLAINTEXT,
        value: value
    }
}

function secretsManagerEnvironmentVariable(value: string): codebuild.BuildEnvironmentVariable{
    return {
        type: BuildEnvironmentVariableType.SECRETS_MANAGER,
        value: value
    }
}