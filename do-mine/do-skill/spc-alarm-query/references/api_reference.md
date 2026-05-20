# SPC 报警事件查询 API 参考文档

## 接口概述

- **接口名称**: SPC 报警问题查询
- **接口类型**: 单次调用
- **请求方式**: POST
- **Content-Type**: multipart/form-data

---

## 五大基地 Base URL

| 基地 | Base URL |
|------|----------|
| 江阴1期 | http://10.202.12.123:6001 |
| 江阴2期 | http://10.210.91.167:6001 |
| 鄂尔多斯 | http://10.205.129.80:6001 |
| 十堰 | http://10.206.129.96:6001 |
| 沧州 | http://10.209.82.101:6001 |

**完整接口地址**: `{Base_URL}/api/Question/SPCQuestionTopList`

---

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| StartTime | string | **是** | 开始时间，格式 yyyy-MM-dd HH:mm:ss |
| EndTime | string | **是** | 结束时间，格式 yyyy-MM-dd HH:mm:ss |
| ProcessCode | string | 否 | 工序编码 |
| ProcessName | string | 否 | 工序名称 |
| LineCode | string | 否 | 产线编码 |
| LineName | string | 否 | 产线名称 |
| EquipmentCode | string | 否 | 设备编码 |
| EquipmentName | string | 否 | 设备名称 |
| ParameterCode | string | 否 | 参数编码 |
| ParameterName | string | 否 | 参数名称 |
| IsSevereAlarm | int | 否 | 1=普通问题，2=严重问题 |

---

## 响应格式

```json
{
  "code": 0,
  "errorMessage": "success",
  "data": [
    {
      "groupCode": "string",
      "groupName": "string",
      "chartTypeCode": "string",
      "chartTypeName": "string",
      "processCode": "string",
      "processName": "string",
      "parameterCode": "string",
      "parameterName": "string",
      "equipmentCode": "string",
      "equipmentName": "string",
      "totalAlarms": 100,
      "completedAlarms": 80,
      "pendingAlarms": 15,
      "reviewAlarms": 5,
      "replyRate": 0.8
    }
  ],
  "tag": {}
}
```

### data 数组元素字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| groupCode / groupName | string | 分组编码/名称 |
| chartTypeCode / chartTypeName | string | 图表类型编码/名称 |
| processCode / processName | string | 工序编码/名称 |
| parameterCode / parameterName | string | 参数编码/名称 |
| equipmentCode / equipmentName | string | 设备编码/名称 |
| totalAlarms | int | 报警总数 |
| completedAlarms | decimal | 已处理数量 |
| pendingAlarms | decimal | 待处理数量 |
| reviewAlarms | decimal | 需审核数量 |
| replyRate | decimal | 回复率（0-1之间的小数，**需乘100转为百分比**） |

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 0 / 200 | 请求成功 |
| 10000002 | 参数为空或无效 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 未找到 |
| 500 | 服务器内部错误 |
| 10000000 | 网络异常 |

---

## curl 调用示例

```bash
# 江阴1期，查询 2024-01-01 至 2024-01-31 的所有报警
curl -X POST "http://10.202.12.123:6001/api/Question/SPCQuestionTopList" \
  -H "Content-Type: multipart/form-data" \
  -F "StartTime=2024-01-01 00:00:00" \
  -F "EndTime=2024-01-31 23:59:59"

# 查询严重报警
curl -X POST "http://10.202.12.123:6001/api/Question/SPCQuestionTopList" \
  -F "StartTime=2024-01-01 00:00:00" \
  -F "EndTime=2024-01-31 23:59:59" \
  -F "IsSevereAlarm=2"

# 按工序筛选
curl -X POST "http://10.202.12.123:6001/api/Question/SPCQuestionTopList" \
  -F "StartTime=2024-01-01 00:00:00" \
  -F "EndTime=2024-01-31 23:59:59" \
  -F "ProcessName=焊接"
```

---

## Python 调用示例

```python
import requests

def query_spc(site_name, start_time, end_time, **kwargs):
    sites = {
        "江阴1期": "http://10.202.12.123:6001",
        "江阴2期": "http://10.210.91.167:6001",
        "鄂尔多斯": "http://10.205.129.80:6001",
        "十堰": "http://10.206.129.96:6001",
        "沧州": "http://10.209.82.101:6001",
    }
    base_url = sites.get(site_name)
    if not base_url:
        raise ValueError(f"未知基地: {site_name}")

    url = f"{base_url}/api/Question/SPCQuestionTopList"
    payload = {
        "StartTime": start_time,
        "EndTime": end_time,
    }
    payload.update(kwargs)

    response = requests.post(url, data=payload)
    return response.json()
```
