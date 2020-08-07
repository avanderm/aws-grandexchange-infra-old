import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as s3 from '@aws-cdk/aws-s3';
interface ServerStackProps extends cdk.StackProps {
    artifactBucket: s3.IBucket;
    keyName: string;
    vpc: ec2.IVpc;
}
export declare class ServerStack extends cdk.Stack {
    readonly backupBucket: s3.Bucket;
    constructor(scope: cdk.Construct, id: string, props: ServerStackProps);
}
export {};
