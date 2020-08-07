import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

export class AgentStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const account = cdk.Stack.of(this).account;
    const region = cdk.Stack.of(this).region;

    const s3Permissions = new iam.PolicyStatement();
    s3Permissions.addResources(
      `arn:aws:s3:::aws-codepipeline-${account}-${region}/*`
    );
    s3Permissions.addActions(
      's3:Get*',
      's3:List*'
    );

    const deployPolicy = new iam.Policy(this, 'CodeDeployS3BucketPolicy', {
      statements: [
        s3Permissions
      ]
    });

    const deployUser = new iam.User(this, 'LightSailCodeDeployUser', {
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchFullAccess')
      ]
    });
    deployPolicy.attachToUser(deployUser);
  }
}
