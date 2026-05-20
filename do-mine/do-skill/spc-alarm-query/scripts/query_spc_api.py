#!/usr/bin/env python3
"""
SPC 报警事件查询脚本

使用方法:
    python query_spc_api.py                           # 查询江阴1期本月数据
    python query_spc_api.py --site 江阴2期            # 查询指定基地
    python query_spc_api.py --sites all --top 10     # 查询所有基地 TOP 10
    python query_spc_api.py --severe                 # 仅查询严重报警
    python query_spc_api.py --process 焊接           # 按工序筛选
"""

import argparse
import requests
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

# 五大基地配置
SITES = {
    "江阴1期": "http://10.202.12.123:6001",
    "江阴2期": "http://10.210.91.167:6001",
    "鄂尔多斯": "http://10.205.129.80:6001",
    "十堰": "http://10.206.129.96:6001",
    "沧州": "http://10.209.82.101:6001",
}


def get_date_range(days: int = 30) -> tuple:
    """获取日期范围（默认近30天）"""
    end_time = datetime.now()
    start_time = end_time - timedelta(days=days)
    return start_time.strftime("%Y-%m-%d %H:%M:%S"), end_time.strftime("%Y-%m-%d %H:%M:%S")


def query_site(
    site_name: str,
    start_time: str,
    end_time: str,
    process_name: Optional[str] = None,
    line_name: Optional[str] = None,
    equipment_name: Optional[str] = None,
    severe_alarm: Optional[int] = None,
) -> Dict[str, Any]:
    """
    查询单个基地的 SPC 报警数据

    Args:
        site_name: 基地名称
        start_time: 开始时间 (yyyy-MM-dd HH:mm:ss)
        end_time: 结束时间
        process_name: 工序名称（可选）
        line_name: 产线名称（可选）
        equipment_name: 设备名称（可选）
        severe_alarm: 严重程度 1=普通 2=严重（可选）

    Returns:
        API 响应字典
    """
    base_url = SITES.get(site_name)
    if not base_url:
        raise ValueError(f"未知基地: {site_name}")

    url = f"{base_url}/api/Question/SPCQuestionTopList"

    # 构建请求参数
    payload = {
        "StartTime": start_time,
        "EndTime": end_time,
    }

    if process_name:
        payload["ProcessName"] = process_name
    if line_name:
        payload["LineName"] = line_name
    if equipment_name:
        payload["EquipmentName"] = equipment_name
    if severe_alarm:
        payload["IsSevereAlarm"] = severe_alarm

    try:
        response = requests.post(url, data=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"code": -1, "errorMessage": str(e), "data": []}


def aggregate_by_process(data: List[Dict]) -> List[Dict]:
    """按工序聚合报警数据"""
    process_stats = {}

    for item in data:
        process_name = item.get("processName", "未知工序")
        if process_name not in process_stats:
            process_stats[process_name] = {
                "processName": process_name,
                "totalAlarms": 0,
                "completedAlarms": 0,
                "pendingAlarms": 0,
                "reviewAlarms": 0,
                "count": 0,
            }

        process_stats[process_name]["totalAlarms"] += item.get("totalAlarms", 0)
        process_stats[process_name]["completedAlarms"] += item.get("completedAlarms", 0)
        process_stats[process_name]["pendingAlarms"] += item.get("pendingAlarms", 0)
        process_stats[process_name]["reviewAlarms"] += item.get("reviewAlarms", 0)
        process_stats[process_name]["count"] += 1

    # 计算回复率
    result = []
    for p in process_stats.values():
        total = p["totalAlarms"]
        completed = p["completedAlarms"]
        p["replyRate"] = (completed / total * 100) if total > 0 else 0
        result.append(p)

    # 按报警数降序排列
    result.sort(key=lambda x: x["totalAlarms"], reverse=True)
    return result


def get_top_equipments(data: List[Dict], top_n: int = 10) -> List[Dict]:
    """获取报警最多的设备列表"""
    result = []
    for item in data:
        total = item.get("totalAlarms", 0)
        completed = item.get("completedAlarms", 0)
        reply_rate = (completed / total * 100) if total > 0 else 0

        result.append({
            "equipmentName": item.get("equipmentName", "未知设备"),
            "processName": item.get("processName", ""),
            "totalAlarms": total,
            "completedAlarms": completed,
            "pendingAlarms": item.get("pendingAlarms", 0),
            "replyRate": round(reply_rate, 1),
        })

    # 按报警数降序排列，取 TOP N
    result.sort(key=lambda x: x["totalAlarms"], reverse=True)
    return result[:top_n]


def format_markdown_report(site_name: str, data: List[Dict], start_time: str, end_time: str) -> str:
    """生成 Markdown 格式的报告"""
    if not data:
        return f"## {site_name}\n\n未查询到数据\n"

    # 汇总统计
    total_alarms = sum(item.get("totalAlarms", 0) for item in data)
    total_completed = sum(item.get("completedAlarms", 0) for item in data)
    total_pending = sum(item.get("pendingAlarms", 0) for item in data)
    total_review = sum(item.get("reviewAlarms", 0) for item in data)
    reply_rate = (total_completed / total_alarms * 100) if total_alarms > 0 else 0

    lines = [
        f"## {site_name}",
        "",
        f"**查询条件**: {start_time} ~ {end_time}",
        "",
        "### 汇总统计",
        f"| 指标 | 数值 |",
        f"|------|------|",
        f"| 报警总数 | {total_alarms:,} |",
        f"| 已处理 | {total_completed:,} |",
        f"| 待处理 | {total_pending:,} |",
        f"| 需审核 | {total_review:,} |",
        f"| 回复率 | {reply_rate:.1f}% |",
        "",
    ]

    # 按工序聚合
    process_stats = aggregate_by_process(data)
    if process_stats:
        lines.extend([
            "### 按工序统计",
            "| 工序 | 报警数 | 已处理 | 待处理 | 回复率 |",
            "|------|--------|--------|--------|--------|",
        ])
        for p in process_stats[:10]:
            rate = p["replyRate"]
            lines.append(f"| {p['processName']} | {p['totalAlarms']:,} | {p['completedAlarms']:,} | {p['pendingAlarms']:,} | {rate:.1f}% |")

    # TOP 10 设备
    top_equipments = get_top_equipments(data, 10)
    if top_equipments:
        lines.extend([
            "",
            "### TOP 10 报警设备",
            "| 设备 | 工序 | 报警数 | 已处理 | 待处理 | 回复率 |",
            "|------|------|--------|--------|--------|--------|",
        ])
        for e in top_equipments:
            lines.append(f"| {e['equipmentName']} | {e['processName']} | {e['totalAlarms']:,} | {e['completedAlarms']:,} | {e['pendingAlarms']:,} | {e['replyRate']:.1f}% |")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="SPC 报警事件查询工具")
    parser.add_argument("--site", default="江阴1期", choices=list(SITES.keys()) + ["all"], help="查询的基地")
    parser.add_argument("--sites", dest="site", default=None, help="别名: --site")
    parser.add_argument("--start", help="开始时间 (yyyy-MM-dd HH:mm:ss)，默认近30天")
    parser.add_argument("--end", help="结束时间，默认当前时间")
    parser.add_argument("--process", help="工序名称筛选")
    parser.add_argument("--line", help="产线名称筛选")
    parser.add_argument("--equipment", help="设备名称筛选")
    parser.add_argument("--severe", action="store_true", help="仅查询严重报警")
    parser.add_argument("--top", type=int, default=10, help="TOP N 数量，默认10")

    args = parser.parse_args()

    # 解析时间参数
    if args.start and args.end:
        start_time = args.start
        end_time = args.end
    else:
        start_time, end_time = get_date_range()

    severe = 2 if args.severe else None

    # 确定查询的基地列表
    if args.site == "all":
        sites_to_query = list(SITES.keys())
    else:
        sites_to_query = [args.site]

    # 执行查询
    print(f"SPC 报警事件查询")
    print(f"时间范围: {start_time} ~ {end_time}")
    print(f"查询基地: {', '.join(sites_to_query)}")
    if severe:
        print("严重程度: 严重问题")
    if args.process:
        print(f"工序筛选: {args.process}")
    print("=" * 60)
    print()

    for site_name in sites_to_query:
        print(f"正在查询 {site_name}...")

        result = query_site(
            site_name=site_name,
            start_time=start_time,
            end_time=end_time,
            process_name=args.process,
            line_name=args.line,
            equipment_name=args.equipment,
            severe_alarm=severe,
        )

        if result.get("code") == 0:
            data = result.get("data", [])
            report = format_markdown_report(site_name, data, start_time, end_time)
            print(report)
        else:
            print(f"查询失败: {result.get('errorMessage', '未知错误')}")

        print()


if __name__ == "__main__":
    main()
