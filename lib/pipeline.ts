import * as cdk from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';

interface PipelineStackProps extends cdk.StackProps {
    artifactBucket: s3.IBucket;
    githubTokenParameter: string;
    repository: string;
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const serviceRole = new iam.Role(this, 'ServiceRole', {
        assumedBy: new iam.ServicePrincipal('codedeploy.amazonaws.com'),
        managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSCodeDeployRole')
        ]
    });

    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
        buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
        environment: {
            buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
            computeType: codebuild.ComputeType.SMALL,
            privileged: true,
            environmentVariables: {
                'BUILD_DIR': {
                    value: 'build',
                    type: codebuild.BuildEnvironmentVariableType.PLAINTEXT
                }
            }
        }
    });

    const deploymentGroup = new codedeploy.ServerDeploymentGroup(this, 'DeploymentGroup', {
        onPremiseInstanceTags: new codedeploy.InstanceTagSet({
            'Name': [
                'InfluxDB'
            ]
        }),
        role: serviceRole
    });

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    new codepipeline.Pipeline(this, 'DeploymentPipeline', {
        artifactBucket: props.artifactBucket,
        stages: [
            {
                stageName: 'Source',
                actions: [
                    new codepipeline_actions.GitHubSourceAction({
                        actionName: 'Source',
                        branch: 'master',
                        oauthToken: cdk.SecretValue.secretsManager(props.githubTokenParameter),
                        output: sourceOutput,
                        owner: 'avanderm',
                        repo: props.repository,
                        trigger: codepipeline_actions.GitHubTrigger.WEBHOOK
                    })
                ]
            },
            {
                stageName: 'Build',
                actions: [
                    new codepipeline_actions.CodeBuildAction({
                        actionName: 'Build',
                        project: buildProject,
                        input: sourceOutput,
                        outputs: [buildOutput],
                        type: codepipeline_actions.CodeBuildActionType.BUILD
                    })
                ]
            },
            {
                stageName: 'Deploy',
                actions: [
                    new codepipeline_actions.CodeDeployServerDeployAction({
                        actionName: 'Deploy',
                        deploymentGroup: deploymentGroup,
                        input: buildOutput
                    })
                ]
            }
        ]
    });
  }
}
