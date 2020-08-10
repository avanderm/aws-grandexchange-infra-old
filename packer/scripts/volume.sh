#!/bin/bash
sudo su <<EOF
mkfs.ext4 /dev/sde
mkdir -p /var/lib/influxdb
echo "/dev/sde /var/lib/influxdb ext4 defaults 0 2" >> /etc/fstab
mount -a
EOF