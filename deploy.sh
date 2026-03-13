#!/bin/bash
# 易知先生 - 一键部署脚本（带 TUI 进度显示）
# 用法: ./deploy.sh [commit message]
#
# 策略：本地构建 → rsync 上传产物 → 服务器只做 restart
# 不依赖服务器上的 npm install / build，更稳定

set -e

SERVER="root@69.5.20.41"
REMOTE_DIR="/var/www/yizhi"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
MSG="${1:-deploy: update $(date '+%Y-%m-%d %H:%M')}"

# ═══════════════════════════════════════════════════════════
# TUI 工具函数
# ═══════════════════════════════════════════════════════════

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# 清除当前行
clear_line() {
  echo -ne "\r\033[K"
}

# 打印标题
print_header() {
  echo -e "${BOLD}${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${CYAN}║${NC}  ${BOLD}易知先生 - 部署系统${NC}                                  ${BOLD}${CYAN}║${NC}"
  echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

# 打印步骤标题
print_step() {
  local step=$1
  local total=$2
  local title=$3
  echo -e "${BOLD}${BLUE}[${step}/${total}]${NC} ${BOLD}${title}${NC}"
}

# 打印进度条
# 用法: print_progress 当前值 总值 标签
print_progress() {
  local current=$1
  local total=$2
  local label=$3
  local percent=$((current * 100 / total))
  local filled=$((percent / 2))
  local empty=$((50 - filled))

  # 构建进度条
  local bar=""
  for ((i=0; i<filled; i++)); do bar="${bar}█"; done
  for ((i=0; i<empty; i++)); do bar="${bar}░"; done

  # 格式化大小
  local current_mb=$(echo "scale=1; $current / 1024 / 1024" | bc)
  local total_mb=$(echo "scale=1; $total / 1024 / 1024" | bc)

  clear_line
  echo -ne "${CYAN}${bar}${NC} ${BOLD}${percent}%${NC} ${DIM}(${current_mb}MB / ${total_mb}MB)${NC} ${label}"
}

# 打印成功消息
print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

# 打印错误消息
print_error() {
  echo -e "${RED}✗${NC} $1"
}

# 打印警告消息
print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# 打印信息消息
print_info() {
  echo -e "${DIM}→${NC} $1"
}

# rsync 进度解析器
# 从 rsync 输出中提取进度信息并显示进度条
rsync_with_progress() {
  local label=$1
  shift
  local rsync_cmd="$@"

  # 使用 pv 如果可用，否则使用 rsync 自带的进度
  if command -v pv &> /dev/null; then
    # 计算总大小
    local total_size=$(eval "$rsync_cmd --dry-run --stats" 2>/dev/null | grep "Total file size" | awk '{print $4}' | tr -d ',')
    if [ -z "$total_size" ] || [ "$total_size" = "0" ]; then
      total_size=1048576  # 默认 1MB
    fi

    # 执行 rsync 并通过 pv 显示进度
    eval "$rsync_cmd --info=progress2" 2>&1 | while IFS= read -r line; do
      if [[ $line =~ ([0-9,]+)[[:space:]]+([0-9]+)% ]]; then
        local bytes=${BASH_REMATCH[1]//,/}
        local percent=${BASH_REMATCH[2]}
        print_progress "$bytes" "$total_size" "$label"
      fi
    done
    clear_line
  else
    # 简化版进度显示
    eval "$rsync_cmd --info=progress2" 2>&1 | while IFS= read -r line; do
      if [[ $line =~ ([0-9,]+)[[:space:]]+([0-9]+)% ]]; then
        local percent=${BASH_REMATCH[2]}
        clear_line
        echo -ne "${CYAN}$label${NC} ${BOLD}${percent}%${NC}"
      fi
    done
    clear_line
  fi
}

# 执行命令并显示 spinner
run_with_spinner() {
  local label=$1
  shift
  local cmd="$@"

  local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  local i=0

  # 在后台执行命令
  eval "$cmd" > /tmp/deploy_output.log 2>&1 &
  local pid=$!

  # 显示 spinner
  while kill -0 $pid 2>/dev/null; do
    i=$(( (i+1) % 10 ))
    clear_line
    echo -ne "${CYAN}${spin:$i:1}${NC} ${label}"
    sleep 0.1
  done

  # 等待命令完成
  wait $pid
  local exit_code=$?

  clear_line
  if [ $exit_code -eq 0 ]; then
    print_success "$label"
  else
    print_error "$label"
    cat /tmp/deploy_output.log
    return $exit_code
  fi
}

# ═══════════════════════════════════════════════════════════
# 主部署流程
# ═══════════════════════════════════════════════════════════

print_header

# ─── 步骤 1: 本地构建后端 ───
print_step 1 6 "构建后端"
cd "$PROJECT_DIR/backend"
run_with_spinner "编译 TypeScript..." "npm run build"
echo ""

# ─── 步骤 2: 本地构建前端 ───
print_step 2 6 "构建前端"
cd "$PROJECT_DIR/frontend"
run_with_spinner "Vite 打包..." "npx vite build"
echo ""

# ─── 步骤 3: 上传后端 ───
print_step 3 6 "上传后端文件"
print_info "同步 dist + prisma + package.json"

# 在后台执行 rsync
(rsync -az --delete \
  --info=progress2 \
  --include='dist/***' \
  --include='prisma/***' \
  --include='package.json' \
  --include='package-lock.json' \
  --exclude='*' \
  "$PROJECT_DIR/backend/" "$SERVER:$REMOTE_DIR/backend/" 2>&1 | \
while IFS= read -r line; do
  if [[ $line =~ ([0-9,]+)[[:space:]]+([0-9]+)%[[:space:]]+([0-9.]+[KMG]B/s) ]]; then
    RSYNC_BYTES=${BASH_REMATCH[1]//,/}
    RSYNC_PERCENT=${BASH_REMATCH[2]}
    RSYNC_SPEED=${BASH_REMATCH[3]}
    clear_line
    echo -ne "${CYAN}▓${NC}$(printf '▓%.0s' $(seq 1 $((RSYNC_PERCENT/2))))$(printf '░%.0s' $(seq 1 $((50-RSYNC_PERCENT/2)))) ${BOLD}${RSYNC_PERCENT}%${NC} ${DIM}${RSYNC_SPEED}${NC}"
  fi
done) &

RSYNC_PID=$!
SPIN_I=0
while kill -0 $RSYNC_PID 2>/dev/null; do
  sleep 0.1
done
wait $RSYNC_PID
RSYNC_EXIT=$?

clear_line
if [ $RSYNC_EXIT -eq 0 ]; then
  print_success "后端文件已上传"
else
  print_error "后端文件上传失败 (exit code: $RSYNC_EXIT)"
  exit 1
fi
echo ""

# ─── 步骤 4: 上传前端 ───
print_step 4 6 "上传前端文件"
print_info "同步 dist 目录"

# 在后台执行 rsync
(rsync -az --delete \
  --info=progress2 \
  "$PROJECT_DIR/frontend/dist/" "$SERVER:$REMOTE_DIR/frontend/" 2>&1 | \
while IFS= read -r line; do
  if [[ $line =~ ([0-9,]+)[[:space:]]+([0-9]+)%[[:space:]]+([0-9.]+[KMG]B/s) ]]; then
    RSYNC_BYTES=${BASH_REMATCH[1]//,/}
    RSYNC_PERCENT=${BASH_REMATCH[2]}
    RSYNC_SPEED=${BASH_REMATCH[3]}
    clear_line
    echo -ne "${CYAN}▓${NC}$(printf '▓%.0s' $(seq 1 $((RSYNC_PERCENT/2))))$(printf '░%.0s' $(seq 1 $((50-RSYNC_PERCENT/2)))) ${BOLD}${RSYNC_PERCENT}%${NC} ${DIM}${RSYNC_SPEED}${NC}"
  fi
done) &

RSYNC_PID=$!
SPIN_I=0
while kill -0 $RSYNC_PID 2>/dev/null; do
  sleep 0.1
done
wait $RSYNC_PID
RSYNC_EXIT=$?

clear_line
if [ $RSYNC_EXIT -eq 0 ]; then
  print_success "前端文件已上传"
else
  print_error "前端文件上传失败 (exit code: $RSYNC_EXIT)"
  exit 1
fi
echo ""

# ─── 步骤 5: 服务器端操作 ───
print_step 5 6 "服务器端配置"

# 5.1 检查依赖是否需要更新
print_info "连接服务器..."

# 在后台执行 SSH 命令
(ssh -o ServerAliveInterval=15 -o ConnectTimeout=10 "$SERVER" bash -s << 'REMOTE'
cd /var/www/yizhi/backend
LOCK_HASH_FILE="/var/www/yizhi/.lock-hash"
NEW_HASH=$(md5sum package-lock.json | cut -d' ' -f1)
OLD_HASH=$(cat "$LOCK_HASH_FILE" 2>/dev/null || echo "")
if [ "$NEW_HASH" != "$OLD_HASH" ]; then
  echo "yes"
else
  echo "no"
fi
REMOTE
) > /tmp/deploy_check.txt 2>&1 &

# 显示 spinner
CHECK_PID=$!
SPIN='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
SPIN_I=0
while kill -0 $CHECK_PID 2>/dev/null; do
  SPIN_I=$(( (SPIN_I+1) % 10 ))
  clear_line
  echo -ne "${CYAN}${SPIN:$SPIN_I:1}${NC} 检查依赖变化..."
  sleep 0.1
done
wait $CHECK_PID
clear_line

NEED_INSTALL=$(cat /tmp/deploy_check.txt)

if [ "$NEED_INSTALL" = "yes" ]; then
  print_warning "依赖有变化，需要安装（这可能需要 1-2 分钟）"

  # 5.2 执行 npm install（带实时输出）
  print_info "执行 npm install --production（预计 1-2 分钟）..."

  (ssh -o ServerAliveInterval=15 -o ConnectTimeout=10 "$SERVER" bash -s << 'REMOTE'
cd /var/www/yizhi/backend
npm install --production 2>&1 | grep -E "(added|removed|updated|packages in)"
REMOTE
  ) > /tmp/deploy_npm.txt 2>&1 &

  # 显示 spinner
  NPM_PID=$!
  SPIN_I=0
  while kill -0 $NPM_PID 2>/dev/null; do
    SPIN_I=$(( (SPIN_I+1) % 10 ))
    clear_line
    echo -ne "${CYAN}${SPIN:$SPIN_I:1}${NC} npm install 进行中..."
    sleep 0.2
  done
  wait $NPM_PID
  clear_line

  # 显示结果
  if [ -s /tmp/deploy_npm.txt ]; then
    NPM_OUTPUT=$(cat /tmp/deploy_npm.txt | tail -1)
    print_success "npm install 完成 ${DIM}($NPM_OUTPUT)${NC}"
  else
    print_success "npm install 完成"
  fi

  # 5.3 生成 Prisma Client
  print_info "生成 Prisma Client..."

  (ssh -o ServerAliveInterval=15 -o ConnectTimeout=10 "$SERVER" bash -s << 'REMOTE'
cd /var/www/yizhi/backend
npx prisma generate 2>&1 | grep -E "(Generated|Prisma Client)"
REMOTE
  ) > /tmp/deploy_prisma.txt 2>&1 &

  # 显示 spinner
  PRISMA_PID=$!
  SPIN_I=0
  while kill -0 $PRISMA_PID 2>/dev/null; do
    SPIN_I=$(( (SPIN_I+1) % 10 ))
    clear_line
    echo -ne "${CYAN}${SPIN:$SPIN_I:1}${NC} 生成 Prisma Client..."
    sleep 0.2
  done
  wait $PRISMA_PID
  clear_line
  print_success "Prisma Client 已生成"

  # 5.4 更新 hash 文件
  ssh -o ServerAliveInterval=15 -o ConnectTimeout=10 "$SERVER" bash -s << 'REMOTE' > /dev/null 2>&1
cd /var/www/yizhi/backend
LOCK_HASH_FILE="/var/www/yizhi/.lock-hash"
NEW_HASH=$(md5sum package-lock.json | cut -d' ' -f1)
echo "$NEW_HASH" > "$LOCK_HASH_FILE"
REMOTE
else
  print_success "依赖无变化，跳过安装"
fi

# 5.5 重启后端服务
print_info "重启后端服务..."

(ssh -o ServerAliveInterval=15 -o ConnectTimeout=10 "$SERVER" "pm2 restart yizhi-backend" > /dev/null 2>&1) &
RESTART_PID=$!
SPIN_I=0
while kill -0 $RESTART_PID 2>/dev/null; do
  SPIN_I=$(( (SPIN_I+1) % 10 ))
  clear_line
  echo -ne "${CYAN}${SPIN:$SPIN_I:1}${NC} 重启后端服务..."
  sleep 0.1
done
wait $RESTART_PID
clear_line

sleep 2
print_success "后端服务已重启"

# 5.6 验证后端存活
print_info "验证服务状态..."

(ssh -o ServerAliveInterval=15 -o ConnectTimeout=10 "$SERVER" "pm2 jlist | grep -o '\"status\":\"[^\"]*\"' | head -1") > /tmp/deploy_status.txt 2>&1 &
STATUS_PID=$!
SPIN_I=0
while kill -0 $STATUS_PID 2>/dev/null; do
  SPIN_I=$(( (SPIN_I+1) % 10 ))
  clear_line
  echo -ne "${CYAN}${SPIN:$SPIN_I:1}${NC} 验证服务状态..."
  sleep 0.1
done
wait $STATUS_PID
clear_line

STATUS=$(cat /tmp/deploy_status.txt)
if echo "$STATUS" | grep -q "online"; then
  print_success "后端服务运行正常"
else
  print_error "后端状态异常: $STATUS"
  echo ""
  echo -e "${YELLOW}最近日志：${NC}"
  ssh -o ServerAliveInterval=15 -o ConnectTimeout=10 "$SERVER" "pm2 logs yizhi-backend --lines 10 --nostream"
  exit 1
fi
echo ""

# ─── 步骤 6: 验证部署 ───
print_step 6 6 "验证部署"

print_info "检查前端..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://69.5.20.41/)
if [ "$HTTP_CODE" = "200" ]; then
  print_success "前端: HTTP $HTTP_CODE"
else
  print_warning "前端: HTTP $HTTP_CODE"
fi

print_info "检查后端 API..."
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://69.5.20.41/api/auth/login)
if [ "$API_CODE" != "502" ]; then
  print_success "后端 API: HTTP $API_CODE"
else
  print_error "后端 API: HTTP $API_CODE"
fi

echo ""

if [ "$HTTP_CODE" = "200" ] && [ "$API_CODE" != "502" ]; then
  echo -e "${BOLD}${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  ${BOLD}✅ 部署成功！${NC}                                          ${BOLD}${GREEN}║${NC}"
  echo -e "${BOLD}${GREEN}╠═══════════════════════════════════════════════════════════╣${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  访问地址: ${CYAN}http://69.5.20.41${NC}                          ${BOLD}${GREEN}║${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  API文档:  ${CYAN}http://69.5.20.41/docs${NC}                     ${BOLD}${GREEN}║${NC}"
  echo -e "${BOLD}${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
else
  echo -e "${BOLD}${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${RED}║${NC}  ${BOLD}⚠️  部署可能有问题，请检查${NC}                          ${BOLD}${RED}║${NC}"
  echo -e "${BOLD}${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi

# ─── Git 提交（可选） ───
echo ""
print_info "提交到 Git..."
cd "$PROJECT_DIR"
git add -A
if git diff --cached --quiet; then
  print_info "Git: 无变更"
else
  git commit -m "$MSG"
  print_success "Git: 已提交"
fi
git push deploy master 2>/dev/null || true

echo ""
