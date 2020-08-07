import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as s3 from '@aws-cdk/aws-s3';

interface ExternalResourcesProps extends cdk.StackProps {
    artifactBucket: string;
    vpcId: string;
}

export class ExternalResources extends cdk.Stack {
    public readonly artifactBucket: s3.IBucket;
    public readonly vpc: ec2.IVpc;

    constructor(scope: cdk.Construct, id: string, props: ExternalResourcesProps) {
        super(scope, id, props);

        const artifactBucket = s3.Bucket.fromBucketName(this, 'ArtifactBucket', props.artifactBucket);

        this.artifactBucket = artifactBucket;

        const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
            vpcId: props.vpcId,
        });

        this.vpc = vpc;
    }
}