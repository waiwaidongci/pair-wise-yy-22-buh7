# 文物修复档案协作平台

面向博物馆修复团队的文物病害记录、修复方案、影像版本和审批归档平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20110>

后端健康检查：<http://localhost:21110/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + Prisma |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `relic-restore`
- `FRONTEND_PORT`: 前端端口，默认 `20110`
- `BACKEND_PORT`: 后端端口，默认 `21110`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: relic-restore`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-relic-restore}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- RelicCondition: constants/RelicCondition、types/RelicCondition、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PlanApprovalStatus: constants/PlanApprovalStatus、types/PlanApprovalStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- DamageSeverity: constants/DamageSeverity、types/DamageSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- 审批把关常量（新增）：
  - `ApprovalPolicy`（前后端 `constants/ApprovalPolicy.*`）：`DUAL_APPROVAL_CONDITIONS` 定义脆弱（FRAGILE）/封存（SEALED）文物须两名不同专家分别同意，`requiredApprovalsForCondition` 计算门槛。
  - `approvalText`（前端 `constants/approvalText.ts`）：依据字段中文名、意见清空原因、同意/驳回文案。
  - 依据字段枚举 `RELIC_CONDITION / DAMAGE_SEVERITY`：见 `types/RestorationPlan` 的 `BasisChange.field`、后端 `utils/approvalPolicy`、前端 `utils/approvalPolicy`、`BasisChangeTags`、审批日志模板。
  - 审批错误码 `PLAN_NOT_FOUND / PLAN_NOT_SUBMITTED / BASIS_STALE / EXPERT_DUPLICATE / APPROVAL_THRESHOLD`：前后端 `constants/errorCodes` 与 `constants/errorMessages`。
  - 审批日志模板 `PlanApproval`：前后端 `constants/logTemplates`（送审/表决/依据变化/内容变化/重新送审/决定）。

## 方案审批如何盯住文物当前情况

- **送审冻结依据**：`POST /api/restoration-plan/:id/submit` 时把当时的文物状态、病害等级、送审时间写入 `approval_basis`，专家看到的永远是这版快照；同时清空旧意见并按快照状态计算 `required_approvals`（脆弱/封存为 2）。
- **任一依据变化即清空待审意见**：馆员经 `PATCH /api/relic-item/:id` 改状态或 `PATCH /api/damage-record/:id` 改分级时，服务层调用 `reconcileBasis`，把在审方案的待审意见清空、在 `basis_changes` 中逐项标出“文物状态/病害等级：旧值 → 新值”，并写审计日志。依据失效期间专家投票返回 `409 BASIS_STALE`，只能重新送审。
- **脆弱/封存双审**：同一方案同一版本每名专家只能投一次票（`EXPERT_DUPLICATE`），须两名不同专家都同意才通过；驳回一票即驳回。
- **方案内容修改重新收集意见**：`PUT /api/restoration-plan/:id/content` 修改标题/方法/风险评估时递增 `content_version`；在审方案立即清空意见并标注 `CONTENT_CHANGED`，已决方案退回草稿需重新送审。
- **审批记录可追溯**：`ApprovalTimeline` 展示送审快照、变更项、每位专家的意见与时间、已同意人数/还差几人、决定时间；`BasisSnapshotCard` 与 `BasisChangeTags` 在方案页、工作台共用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
