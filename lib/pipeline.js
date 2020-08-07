"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const codebuild = require("@aws-cdk/aws-codebuild");
const codedeploy = require("@aws-cdk/aws-codedeploy");
const codepipeline = require("@aws-cdk/aws-codepipeline");
const codepipeline_actions = require("@aws-cdk/aws-codepipeline-actions");
const iam = require("@aws-cdk/aws-iam");
class PipelineStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.PipelineStack = PipelineStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwaXBlbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFxQztBQUNyQyxvREFBb0Q7QUFDcEQsc0RBQXNEO0FBQ3RELDBEQUEwRDtBQUMxRCwwRUFBMEU7QUFDMUUsd0NBQXdDO0FBU3hDLE1BQWEsYUFBYyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzFDLFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBeUI7UUFDckUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDbEQsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLDBCQUEwQixDQUFDO1lBQy9ELGVBQWUsRUFBRTtnQkFDYixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLGdDQUFnQyxDQUFDO2FBQy9FO1NBQ0osQ0FBQyxDQUFDO1FBRUgsTUFBTSxZQUFZLEdBQUcsSUFBSSxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDckUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDO1lBQ2xFLFdBQVcsRUFBRTtnQkFDVCxVQUFVLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0I7Z0JBQ3RELFdBQVcsRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUs7Z0JBQ3hDLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixvQkFBb0IsRUFBRTtvQkFDbEIsV0FBVyxFQUFFO3dCQUNULEtBQUssRUFBRSxPQUFPO3dCQUNkLElBQUksRUFBRSxTQUFTLENBQUMsNEJBQTRCLENBQUMsU0FBUztxQkFDekQ7aUJBQ0o7YUFDSjtTQUNKLENBQUMsQ0FBQztRQUVILE1BQU0sZUFBZSxHQUFHLElBQUksVUFBVSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUNsRixxQkFBcUIsRUFBRSxJQUFJLFVBQVUsQ0FBQyxjQUFjLENBQUM7Z0JBQ2pELE1BQU0sRUFBRTtvQkFDSixVQUFVO2lCQUNiO2FBQ0osQ0FBQztZQUNGLElBQUksRUFBRSxXQUFXO1NBQ3BCLENBQUMsQ0FBQztRQUVILE1BQU0sWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pELE1BQU0sV0FBVyxHQUFHLElBQUksWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWhELElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDbEQsY0FBYyxFQUFFLEtBQUssQ0FBQyxjQUFjO1lBQ3BDLE1BQU0sRUFBRTtnQkFDSjtvQkFDSSxTQUFTLEVBQUUsUUFBUTtvQkFDbkIsT0FBTyxFQUFFO3dCQUNMLElBQUksb0JBQW9CLENBQUMsa0JBQWtCLENBQUM7NEJBQ3hDLFVBQVUsRUFBRSxRQUFROzRCQUNwQixNQUFNLEVBQUUsUUFBUTs0QkFDaEIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQzs0QkFDdEUsTUFBTSxFQUFFLFlBQVk7NEJBQ3BCLEtBQUssRUFBRSxVQUFVOzRCQUNqQixJQUFJLEVBQUUsS0FBSyxDQUFDLFVBQVU7NEJBQ3RCLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsT0FBTzt5QkFDdEQsQ0FBQztxQkFDTDtpQkFDSjtnQkFDRDtvQkFDSSxTQUFTLEVBQUUsT0FBTztvQkFDbEIsT0FBTyxFQUFFO3dCQUNMLElBQUksb0JBQW9CLENBQUMsZUFBZSxDQUFDOzRCQUNyQyxVQUFVLEVBQUUsT0FBTzs0QkFDbkIsT0FBTyxFQUFFLFlBQVk7NEJBQ3JCLEtBQUssRUFBRSxZQUFZOzRCQUNuQixPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUM7NEJBQ3RCLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLO3lCQUN2RCxDQUFDO3FCQUNMO2lCQUNKO2dCQUNEO29CQUNJLFNBQVMsRUFBRSxRQUFRO29CQUNuQixPQUFPLEVBQUU7d0JBQ0wsSUFBSSxvQkFBb0IsQ0FBQyw0QkFBNEIsQ0FBQzs0QkFDbEQsVUFBVSxFQUFFLFFBQVE7NEJBQ3BCLGVBQWUsRUFBRSxlQUFlOzRCQUNoQyxLQUFLLEVBQUUsV0FBVzt5QkFDckIsQ0FBQztxQkFDTDtpQkFDSjthQUNKO1NBQ0osQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBaEZELHNDQWdGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCAqIGFzIGNvZGVidWlsZCBmcm9tICdAYXdzLWNkay9hd3MtY29kZWJ1aWxkJztcbmltcG9ydCAqIGFzIGNvZGVkZXBsb3kgZnJvbSAnQGF3cy1jZGsvYXdzLWNvZGVkZXBsb3knO1xuaW1wb3J0ICogYXMgY29kZXBpcGVsaW5lIGZyb20gJ0Bhd3MtY2RrL2F3cy1jb2RlcGlwZWxpbmUnO1xuaW1wb3J0ICogYXMgY29kZXBpcGVsaW5lX2FjdGlvbnMgZnJvbSAnQGF3cy1jZGsvYXdzLWNvZGVwaXBlbGluZS1hY3Rpb25zJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdAYXdzLWNkay9hd3MtaWFtJztcbmltcG9ydCAqIGFzIHMzIGZyb20gJ0Bhd3MtY2RrL2F3cy1zMyc7XG5cbmludGVyZmFjZSBQaXBlbGluZVN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gICAgYXJ0aWZhY3RCdWNrZXQ6IHMzLklCdWNrZXQ7XG4gICAgZ2l0aHViVG9rZW5QYXJhbWV0ZXI6IHN0cmluZztcbiAgICByZXBvc2l0b3J5OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBQaXBlbGluZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBQaXBlbGluZVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHNlcnZpY2VSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdTZXJ2aWNlUm9sZScsIHtcbiAgICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2NvZGVkZXBsb3kuYW1hem9uYXdzLmNvbScpLFxuICAgICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0NvZGVEZXBsb3lSb2xlJylcbiAgICAgICAgXVxuICAgIH0pO1xuXG4gICAgY29uc3QgYnVpbGRQcm9qZWN0ID0gbmV3IGNvZGVidWlsZC5QaXBlbGluZVByb2plY3QodGhpcywgJ0J1aWxkUHJvamVjdCcsIHtcbiAgICAgICAgYnVpbGRTcGVjOiBjb2RlYnVpbGQuQnVpbGRTcGVjLmZyb21Tb3VyY2VGaWxlbmFtZSgnYnVpbGRzcGVjLnltbCcpLFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgYnVpbGRJbWFnZTogY29kZWJ1aWxkLkxpbnV4QnVpbGRJbWFnZS5BTUFaT05fTElOVVhfMl8zLFxuICAgICAgICAgICAgY29tcHV0ZVR5cGU6IGNvZGVidWlsZC5Db21wdXRlVHlwZS5TTUFMTCxcbiAgICAgICAgICAgIHByaXZpbGVnZWQ6IHRydWUsXG4gICAgICAgICAgICBlbnZpcm9ubWVudFZhcmlhYmxlczoge1xuICAgICAgICAgICAgICAgICdCVUlMRF9ESVInOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnYnVpbGQnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBjb2RlYnVpbGQuQnVpbGRFbnZpcm9ubWVudFZhcmlhYmxlVHlwZS5QTEFJTlRFWFRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGRlcGxveW1lbnRHcm91cCA9IG5ldyBjb2RlZGVwbG95LlNlcnZlckRlcGxveW1lbnRHcm91cCh0aGlzLCAnRGVwbG95bWVudEdyb3VwJywge1xuICAgICAgICBvblByZW1pc2VJbnN0YW5jZVRhZ3M6IG5ldyBjb2RlZGVwbG95Lkluc3RhbmNlVGFnU2V0KHtcbiAgICAgICAgICAgICdOYW1lJzogW1xuICAgICAgICAgICAgICAgICdJbmZsdXhEQidcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSksXG4gICAgICAgIHJvbGU6IHNlcnZpY2VSb2xlXG4gICAgfSk7XG5cbiAgICBjb25zdCBzb3VyY2VPdXRwdXQgPSBuZXcgY29kZXBpcGVsaW5lLkFydGlmYWN0KCk7XG4gICAgY29uc3QgYnVpbGRPdXRwdXQgPSBuZXcgY29kZXBpcGVsaW5lLkFydGlmYWN0KCk7XG5cbiAgICBuZXcgY29kZXBpcGVsaW5lLlBpcGVsaW5lKHRoaXMsICdEZXBsb3ltZW50UGlwZWxpbmUnLCB7XG4gICAgICAgIGFydGlmYWN0QnVja2V0OiBwcm9wcy5hcnRpZmFjdEJ1Y2tldCxcbiAgICAgICAgc3RhZ2VzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RhZ2VOYW1lOiAnU291cmNlJyxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIG5ldyBjb2RlcGlwZWxpbmVfYWN0aW9ucy5HaXRIdWJTb3VyY2VBY3Rpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uTmFtZTogJ1NvdXJjZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBicmFuY2g6ICdtYXN0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2F1dGhUb2tlbjogY2RrLlNlY3JldFZhbHVlLnNlY3JldHNNYW5hZ2VyKHByb3BzLmdpdGh1YlRva2VuUGFyYW1ldGVyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogc291cmNlT3V0cHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6ICdhdmFuZGVybScsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBvOiBwcm9wcy5yZXBvc2l0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlcjogY29kZXBpcGVsaW5lX2FjdGlvbnMuR2l0SHViVHJpZ2dlci5XRUJIT09LXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdGFnZU5hbWU6ICdCdWlsZCcsXG4gICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBuZXcgY29kZXBpcGVsaW5lX2FjdGlvbnMuQ29kZUJ1aWxkQWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbk5hbWU6ICdCdWlsZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBidWlsZFByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogc291cmNlT3V0cHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0czogW2J1aWxkT3V0cHV0XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNvZGVwaXBlbGluZV9hY3Rpb25zLkNvZGVCdWlsZEFjdGlvblR5cGUuQlVJTERcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YWdlTmFtZTogJ0RlcGxveScsXG4gICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBuZXcgY29kZXBpcGVsaW5lX2FjdGlvbnMuQ29kZURlcGxveVNlcnZlckRlcGxveUFjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25OYW1lOiAnRGVwbG95JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGxveW1lbnRHcm91cDogZGVwbG95bWVudEdyb3VwLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IGJ1aWxkT3V0cHV0XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==