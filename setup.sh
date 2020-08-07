#!/bin/bash -ex
stackId=$1
region=$2
waitConditionHandle=$3

yum update -y aws-cfn-bootstrap awscli
function error_exit {
    /opt/aws/bin/cfn-signal -e 1 -r "$1" $2
    exit 1
}

cd /home/ec2-user/

aws s3 cp "s3://aws-codedeploy-$region/latest/codedeploy-agent.noarch.rpm" . || error_exit "Failed to download AWS CodeDeploy Agent." $waitConditionHandle
yum -y install codedeploy-agent.noarch.rpm || error_exit "Failed to install AWS CodeDeploy Agent." $waitConditionHandle

/opt/aws/bin/cfn-init -s $stackId -r LinuxEC2Instance --region $region || error_exit "Failed to run cfn-init." $waitConditionHandle
/opt/aws/bin/cfn-signal -e 0 -r "AWS CodeDeploy Agent setup complete." ${waitConditionHandle}