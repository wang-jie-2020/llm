# SPC 系统报警事件查询技能

## 技能信息

- **名称**: SPC 报警事件查询
- **触发词**: SPC报警事件统计、SPC报警事件查询、SPC报警事件回复率、报警事件处理情况、产线报警、工序报警、设备报警、质量报警、SPC问题统计
- **适用范围**: 用户级别（所有项目可用）

---

## 技能说明

当用户提到 SPC 报警事件统计、查询、回复率、处理情况、产线/工序/设备报警数量等质量相关查询时，优先使用此技能。支持按时间、产线、工序、设备、问题严重程度等多维度查询 SPC 报警事件数据。支持多基地查询。

---

## 支持的查询维度

| 维度 | 参数 | 说明 |
|------|------|------|
| 时间范围 | StartTime, EndTime | 必填，格式 yyyy-MM-dd HH:mm:ss |
| 基地 | site | 江阴1期、江阴2期、鄂尔多斯、十堰、沧州 |
| 产线 | LineName / LineCode | 可选 |
| 工序 | ProcessName / ProcessCode | 可选 |
| 设备 | EquipmentName / EquipmentCode | 可选 |
| 参数 | ParameterName / ParameterCode | 可选 |
| 严重程度 | IsSevereAlarm | 1=普通问题，2=严重问题 |

---

## 五大生产基地

| 基地名称 | API Base URL |
|----------|-------------|
| 江阴1期 | http://10.202.12.123:6001 |
| 江阴2期 | http://10.210.91.167:6001 |
| 鄂尔多斯 | http://10.205.129.80:6001 |
| 十堰 | http://10.206.129.96:6001 |
| 沧州 | http://10.209.82.101:6001 |

---

## API 接口

- **接口路径**: POST /api/Question/SPCQuestionTopList
- **Content-Type**: multipart/form-data

### 请求示例

```python
# 调用示例（见 scripts/query_spc_api.py）
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| totalAlarms | int | 报警总数 |
| completedAlarms | decimal | 已处理数 |
| pendingAlarms | decimal | 待处理数 |
| reviewAlarms | decimal | 需审核数 |
| replyRate | decimal | 回复率（0-1小数，需×100转为百分比） |
| processName | string | 工序名称 |
| equipmentName | string | 设备名称 |
| lineName | string | 产线名称 |

---

## 输出格式

查询结果以 Markdown 表格形式呈现，包含：
1. 查询条件汇总（时间范围、基地、筛选条件）
2. 汇总统计（总报警数、回复率等）
3. 明细表格（支持按工序/设备聚合的 TOP 排名）

---

## 相关文件

- **API 参考**: references/api_reference.md
- **查询示例**: references/query_examples.md
- **查询脚本**: scripts/query_spc_api.py
