# NAS 部署 JSON 文件服务

## 部署步骤

1. **上传文件到 NAS**
   - 将此目录上传到 NAS 的 `/volume1/docker/yizhi-deploy/`
   - 将 JSON 数据文件放到 `/volume1/docker/yizhi-data/`

2. **启动服务**
   ```bash
   cd /volume1/docker/yizhi-deploy
   docker-compose up -d
   ```

3. **验证**
   - 访问：http://nas-ip:8080
   - 测试 JSON：http://nas-ip:8080/classics/yizang/xxx.json

4. **内网穿透后**
   - 前端访问：https://your-domain.com:59000/classics/yizang/xxx.json

## 目录结构

```
/volume1/docker/
├── yizhi-deploy/          # 部署配置
│   ├── docker-compose.yml
│   └── nginx.conf
└── yizhi-data/            # JSON 数据文件
    └── classics/
        ├── yizang/
        ├── yizang_medical/
        ├── shizang/
        └── daozang/
```

## 管理命令

```bash
# 启动
docker-compose up -d

# 停止
docker-compose down

# 查看日志
docker-compose logs -f

# 重启
docker-compose restart
```
