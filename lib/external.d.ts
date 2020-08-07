import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as s3 from '@aws-cdk/aws-s3';
interface ExternalResourcesProps extends cdk.StackProps {
    artifactBucket: string;
    vpcId: string;
}
export declare class ExternalResources extends cdk.Stack {
    readonly artifactBucket: s3.IBucket;
    readonly vpc: ec2.IVpc;
    constructor(scope: cdk.Construct, id: string, props: ExternalResourcesProps);
}
export {};
