#!/bin/bash
cat <<EOF | sudo tee /etc/yum.repos.d/influxdb.repo
[influxdb]
name = InfluxDB Repository - RHEL 6
baseurl = https://repos.influxdata.com/rhel/6/\$basearch/stable
enabled = 1
gpgcheck = 1
gpgkey = https://repos.influxdata.com/influxdb.key
EOF

sudo yum install telegraf -y
sudo yum install influxdb -y
wget https://dl.influxdata.com/chronograf/releases/chronograf-1.8.5.x86_64.rpm
sudo yum localinstall chronograf-1.8.5.x86_64.rpm -y
wget https://dl.influxdata.com/kapacitor/releases/kapacitor-1.5.5-1.x86_64.rpm
sudo yum localinstall kapacitor-1.5.5-1.x86_64.rpm -y