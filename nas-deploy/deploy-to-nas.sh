#!/bin/bash

# 极空间 NAS 部署脚本
# 使用方法: ./deploy-to-nas.sh NAS_IP

set -e

# 检查参数
if [ -z "$1" ]; then
    echo "使用方法: ./deploy-to-nas.sh NAS_IP"
    echo "示例: ./deploy-to-nas.sh 192.168.1.100"
    exit 1
fi

NAS_IP=$1
NAS_USER=${2:-root}  # 默认使用 root 用户

echo "=========================================="
echo "极空间 NAS 部署脚本"
echo "=========================================="
echo "NAS IP: $NAS_IP"
echo "用户: $NAS_USER"
echo ""

# 1. 在 NAS 上创建目录
echo "步骤 1/4: 创建 NAS 目录..."
ssh $NAS_USER@$NAS_IP "mkdir -p /volume1/docker/yizhi-deploy && mkdir -p /volume1/docker/yizhi-data/classics"

# 2. 上传配置文件
echo "步骤 2/4: 上传配置文件..."
scp docker-compose.yml $NAS_USER@$NAS_IP:/volume1/docker/yizhi-deploy/
scp nginx.conf $NAS_USER@$NAS_IP:/volume1/docker/yizhi-deploy/
scp 部署指南.md $NAS_USER@$NAS_IP:/volume1/docker/yizhi-deploy/

# 3. 上传数据文件（这一步会比较慢）
echo "步骤 3/4: 上传数据文件（6.9GB，需要较长时间）..."
echo "提示：如果网络较慢，建议使用 SMB 共享手动复制"
read -p "是否继续通过 SCP 上传？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    scp -r ../daizhigev20 $NAS_USER@$NAS_IP:/volume1/docker/yizhi-data/classics/
else
    echo "跳过数据上传，请手动复制 daizhigev20 目录到 NAS:/volume1/docker/yizhi-data/classics/"
fi

# 4. 启动 Docker 服务
echo "步骤 4/4: 启动 Docker 服务..."
ssh $NAS_USER@$NAS_IP "cd /volume1/docker/yizhi-deploy && docker-compose up -d"

# 5. 验证
echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "内网访问地址："
echo "  http://$NAS_IP:8080/classics/daizhigev20/"
echo ""
echo "查看容器状态："
echo "  ssh $NAS_USER@$NAS_IP 'docker ps | grep yizhi'"
echo ""
echo "查看日志："
echo "  ssh $NAS_USER@$NAS_IP 'docker logs yizhi-json-server'"
echo ""
echo "下一步："
echo "  1. 在极空间 App 中配置内网穿透（端口 8080 → 59000）"
echo "  2. 获取公网地址（如 https://xxx.zspace.cn:59000）"
echo "  3. 更新前端配置文件中的数据 URL"
echo ""
