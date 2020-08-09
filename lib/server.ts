import * as cdk from '@aws-cdk/core';
import * as cfn from '@aws-cdk/aws-cloudformation';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';

import fs = require('fs');
import yaml = require('yaml');
import { readFileSync } from 'fs';

interface ServerStackProps extends cdk.StackProps {
    artifactBucket: s3.IBucket;
    instanceAmi: string;
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
            ],
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        this.backupBucket = backupBucket;

        const instanceRole = new iam.Role(this, 'InstanceRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
        });

        const instanceRolePolicy = new iam.Policy(this, 'InstanceRolePolicy', {
            statements: [
                new iam.PolicyStatement({
                    actions: [
                        "s3:Get*",
                        "s3:List*"
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

        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8086), 'InfluxDB access');
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8888), 'Chronograf access');
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH access');

        const serverResourceName = 'ServerInstance';

        const userData = ec2.UserData.forLinux();

        const instance = new ec2.Instance(this, 'Server', {
            blockDevices: [
                {
                    deviceName: '/dev/sdf',
                    volume: volume
                }
            ],
            instanceName: serverResourceName,
            instanceType: new ec2.InstanceType('t3a.small'),
            machineImage: ec2.MachineImage.genericLinux({
                "eu-west-1": props.instanceAmi
            }),
            keyName: props.keyName,
            role: instanceRole,
            securityGroup: securityGroup,
            userData: userData,
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            }
        });

        const cfnInstance = instance.node.defaultChild as ec2.CfnInstance;

        userData.addCommands(
            "yum -y update",
            "yum -y install cfn-bootstrap",
            `/opt/aws/bin/cfn-init -v --stack ${stackId} --resource ${this.getLogicalId(cfnInstance)} --region ${region}`
        )

        cfnInstance.cfnOptions.metadata = {
            "AWS::CloudFormation::Init": {
                "config": {
                    "packages": {
                        "yum": {
                            "ruby": []
                        }
                    },
                    "files": {
                        "/home/ec2-user/install": {
                            "source": `https://aws-codedeploy-${region}.s3.amazonaws.com/latest/install`,
                            "mode": "000755"
                        }
                    },
                    "commands": {
                        "00-install-agent": {
                            "command": "./install auto",
                            "cwd": "/home/ec2-user/"
                        },
                        "01-cfn-signal": {
                            "command": `/opt/aws/bin/cfn-signal -e 0 --stack ${stackId} --resource ${this.getLogicalId(cfnInstance)} --region ${region}`
                        }
                    },
                    "services": {
                        "sysvinit": {
                            "codedeploy-agent": {
                                "enabled": true,
                                "ensureRunning": true
                            },
                            "influxdb": {
                                "enabled": true,
                                "ensureRunning": true
                            },
                            "telegraf": {
                                "enabled": true,
                                "ensureRunning": true
                            },
                            "kapacitor": {
                                "enabled": true,
                                "ensureRunning": true
                            },
                            "chronograf": {
                                "enabled": true,
                                "ensureRunning": true
                            }
                        }
                    }
                }
            }
        };
    }
}