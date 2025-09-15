#!/bin/bash

echo "📄 PRD 状态报告"
echo "===================="
echo ""

if [ ! -d ".claude/prds" ]; then
  echo "未找到 PRD 目录。"
  exit 0
fi

total=$(ls .claude/prds/*.md 2>/dev/null | wc -l)
[ $total -eq 0 ] && echo "未找到 PRD。" && exit 0

# Count by status
backlog=0
in_progress=0
implemented=0

for file in .claude/prds/*.md; do
  [ -f "$file" ] || continue
  status=$(grep "^status:" "$file" | head -1 | sed 's/^status: *//')

  case "$status" in
    backlog|draft|"") ((backlog++)) ;;
    in-progress|active) ((in_progress++)) ;;
    implemented|completed|done) ((implemented++)) ;;
    *) ((backlog++)) ;;
  esac
done

echo "正在获取状态..."
echo ""
echo ""

# Display chart
echo "📊 分布情况:"
echo "================"

echo ""
echo "  Backlog:     $(printf '%-3d' $backlog) [$(printf '%0.s█' $(seq 1 $((backlog*20/total))))]"
echo "  In Progress: $(printf '%-3d' $in_progress) [$(printf '%0.s█' $(seq 1 $((in_progress*20/total))))]"
echo "  Implemented: $(printf '%-3d' $implemented) [$(printf '%0.s█' $(seq 1 $((implemented*20/total))))]"
echo ""
echo "  Total PRDs: $total"

# Recent activity
echo ""
echo "📅 最近的 PRD (最近修改的 5 个):"
ls -t .claude/prds/*.md 2>/dev/null | head -5 | while read file; do
  name=$(grep "^name:" "$file" | head -1 | sed 's/^name: *//')
  [ -z "$name" ] && name=$(basename "$file" .md)
  echo "  • $name"
done

# Suggestions
echo ""
echo "💡 下一步操作:"
[ $backlog -gt 0 ] && echo "  • 将待办 PRD 解析为史诗: /pm:prd-parse <name>"
[ $in_progress -gt 0 ] && echo "  • 检查活跃 PRD 的进度: /pm:epic-status <name>"
[ $total -eq 0 ] && echo "  • 创建您的第一个 PRD: /pm:prd-new <name>"

exit 0
