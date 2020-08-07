import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
interface PipelineStackProps extends cdk.StackProps {
    artifactBucket: s3.IBucket;
    githubTokenParameter: string;
    repository: string;
}
export declare class PipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: PipelineStackProps);
}
export {};
