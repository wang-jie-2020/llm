---
name: healthcare-phi-compliance
description: 医疗保健应用程序的受保护健康信息 (PHI) 和个人身份信息 (PII) 合规模式。涵盖数据分类、访问控制、审计跟踪、加密和常见泄漏向量。origin: Health1 Super Speciality Hospitals — contributed by Dr. Keyur Patel
version: "1.0.0"
---
# 医疗保健 PHI/PII 合规模式

在医疗保健应用程序中保护患者数据、临床医生数据和财务数据的模式。适用于 HIPAA（美国）、DISHA（印度）、GDPR（欧盟）和一般医疗保健数据保护。

## 何时使用

- 构建任何涉及患者记录的功能
- 实施临床系统的访问控制或身份验证
- 设计医疗保健数据的数据库模式
- 构建返回患者或临床医生数据的 API
- 实施审计跟踪或日志记录
- 审查代码是否存在数据泄露漏洞
- 为多租户医疗保健系统设置行级安全性 (RLS)

## 它是如何工作的

医疗保健数据保护分为三层：**分类**（敏感内容）、**访问控制**（谁可以看到它）和**审计**（谁确实看到了它）。

### 数据分类**PHI（受保护的健康信息）** — 可以识别患者身份并与其健康相关的任何数据：患者姓名、出生日期、地址、电话、电子邮件、国民身份证号码（SSN、Aadhaar、NHS 号码）、医疗记录号码、诊断、药物、实验室结果、影像、保险单和索赔详细信息、预约和入院记录或上述的任意组合。

**医疗保健系统中的 PII（非患者敏感数据）**：临床医生/员工个人详细信息、医生费用结构和支付金额、员工工资和银行详细信息、供应商付款信息。

### 访问控制：行级安全性```sql
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Scope access by facility
CREATE POLICY "staff_read_own_facility"
  ON patients FOR SELECT TO authenticated
  USING (facility_id IN (
    SELECT facility_id FROM staff_assignments
    WHERE user_id = auth.uid() AND role IN ('doctor','nurse','lab_tech','admin')
  ));

-- Audit log: insert-only (tamper-proof)
CREATE POLICY "audit_insert_only" ON audit_log FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "audit_no_modify" ON audit_log FOR UPDATE USING (false);
CREATE POLICY "audit_no_delete" ON audit_log FOR DELETE USING (false);
```
### 审计追踪

必须记录每次 PHI 访问或修改：```typescript
interface AuditEntry {
  timestamp: string;
  user_id: string;
  patient_id: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'print' | 'export';
  resource_type: string;
  resource_id: string;
  changes?: { before: object; after: object };
  ip_address: string;
  session_id: string;
}
```
### 常见泄漏向量

**错误消息：** 切勿在向客户端抛出的错误消息中包含患者识别数据。仅记录服务器端的详细信息。

**控制台输出：** 切勿记录完整的患者对象。使用不透明的内部记录 ID (UUID)，而不是医疗记录号、国民 ID 或姓名。

**URL 参数：** 切勿将患者识别数据放入可能出现在日志或浏览器历史记录中的查询字符串或路径段中。仅使用不透明的 UUID。

**浏览器存储：**切勿将 PHI 存储在 localStorage 或 sessionStorage 中。仅将 PHI 保留在内存中，按需获取。

**服务角色键：** 切勿在客户端代码中使用 service_role 键。始终使用匿名/可发布密钥并让 RLS 强制访问。

**日志和监控：**切勿记录完整的患者记录。仅使用不透明的记录 ID（而非医疗记录编号）。在发送到错误跟踪服务之前清理堆栈跟踪。

### 数据库模式标记

在架构级别标记 PHI/PII 列：```sql
COMMENT ON COLUMN patients.name IS 'PHI: patient_name';
COMMENT ON COLUMN patients.dob IS 'PHI: date_of_birth';
COMMENT ON COLUMN patients.aadhaar IS 'PHI: national_id';
COMMENT ON COLUMN doctor_payouts.amount IS 'PII: financial';
```
### 部署清单

每次部署之前：
- 错误消息或堆栈跟踪中没有 PHI
- console.log/console.error 中没有 PHI
- URL 参数中没有 PHI
- 浏览器存储中没有 PHI
- 客户端代码中没有 service_role 键
- 在所有 PHI/PII 表上启用 RLS
- 所有数据修改的审计跟踪
- 配置会话超时
- 所有 PHI 端点上的 API 身份验证
- 跨设施数据隔离验证

## 示例

### 示例 1：安全与不安全的错误处理```typescript
// BAD — leaks PHI in error
throw new Error(`Patient ${patient.name} not found in ${patient.facility}`);

// GOOD — generic error, details logged server-side with opaque IDs only
logger.error('Patient lookup failed', { recordId: patient.id, facilityId });
throw new Error('Record not found');
```
### 示例 2：多设施隔离的 RLS 策略```sql
-- Doctor at Facility A cannot see Facility B patients
CREATE POLICY "facility_isolation"
  ON patients FOR SELECT TO authenticated
  USING (facility_id IN (
    SELECT facility_id FROM staff_assignments WHERE user_id = auth.uid()
  ));

-- Test: login as doctor-facility-a, query facility-b patients
-- Expected: 0 rows returned
```
### 示例 3：安全日志记录```typescript
// BAD — logs identifiable patient data
console.log('Processing patient:', patient);

// GOOD — logs only opaque internal record ID
console.log('Processing record:', patient.id);
// Note: even patient.id should be an opaque UUID, not a medical record number
```
