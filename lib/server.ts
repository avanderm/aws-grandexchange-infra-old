import * as cdk from '@aws-cdk/core';
import * as cfn from '@aws-cdk/aws-cloudformation';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';

interface ServerStackProps extends cdk.StackProps {
    artifactBucket: s3.IBucket;
    keyName: string;
    vpc: ec2.IVpc;
}

export class ServerStack extends cdk.Stack {
    public readonly backupBucket: s3.Bucket;

    constructor(scope: cdk.Construct, id: string, props: ServerStackProps) {
        super(scope, id, props);

        const stackId = cdk.Stack.of(this).stackId;
        const region = cdk.Stack.of(this).region;

        const backupBucket = new s3.Bucket(this, 'BackupStorage', {
            lifecycleRules: [
                {
                    enabled: true,
                    expiration: cdk.Duration.days(7)
                }
            ]
        });

        this.backupBucket = backupBucket;

        const instanceRole = new iam.Role(this, 'InstanceRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
        });

        const instanceRolePolicy = new iam.Policy(this, 'InstanceRolePolicy', {
            statements: [
                new iam.PolicyStatement({
                    actions: [
                        "s3:Get*"
                    ],
                    resources: [
                        "*"
                    ]
                })
            ]
        });

        instanceRolePolicy.attachToRole(instanceRole);

        const volume = ec2.BlockDeviceVolume.ebs(20, {
            deleteOnTermination: false,
            volumeType: ec2.EbsDeviceVolumeType.STANDARD
        });

        const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc: props.vpc
        });

        securityGroup.addIngressRule( ec2.Peer.anyIpv4(), ec2.Port.tcp(8086), 'InfluxDB access');
        securityGroup.addIngressRule( ec2.Peer.anyIpv4(), ec2.Port.tcp(8888), 'Chronograf access');

        const waitHandle = new cfn.CfnWaitConditionHandle(this, 'CodeDeployInstallHandle');

        const waitCondition = new cfn.CfnWaitCondition(this, 'CodeDeployInstall', {
            handle: waitHandle.ref
        });

        const userData = ec2.UserData.forLinux();
        userData.addS3DownloadCommand({
            bucket: props.artifactBucket,
            bucketKey: 'setup.sh'
        });
        userData.addExecuteFileCommand({
            filePath: 'setup.sh',
            arguments: `${stackId} ${region} ${waitHandle}`
        });

        const instance = new ec2.Instance(this, 'Server', {
            blockDevices: [
                {
                    deviceName: '/dev/sdf',
                    volume: volume
                }
            ],
            instanceType: new ec2.InstanceType('t3a.small'),
            machineImage: ec2.MachineImage.latestAmazonLinux(),
            keyName: props.keyName,
            role: instanceRole,
            securityGroup: securityGroup,
            userData: userData,
            vpc: props.vpc
        });

        const cfnInstance = instance.node.defaultChild as ec2.CfnInstance;

        cfnInstance.cfnOptions.metadata = {
            "AWS::CloudFormation::Init": {
                "services": {
                    "sysvint": {
                        "codedeploy-agent": {
                            "enabled": "true",
                            "ensureRunning": "true"
                        }
                    }
                }
            }
        };
    }
}