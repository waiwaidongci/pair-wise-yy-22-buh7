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
- PlanBasisChangeType（RELIC_CONDITION / DAMAGE_SEVERITY / CONTENT，送审依据变化项）:
  - 后端：`backend/src/constants/PlanApprovalStatus.ts`、`models/RestorationPlan.ts`、`models/PlanApprovalOpinion.ts`、`services/planApprovalPolicy.ts`、`services/RestorationPlanService.ts`、`repositories/PlanApprovalOpinionRepository.ts`、`utils/formatters`（前端同名）、审批日志模板 `constants/logTemplates.ts`。
  - 前端：`constants/PlanApprovalStatus.ts`、`types/PlanApprovalStatus.ts`、`types/RestorationPlan.ts`、`utils/planApprovalPolicy.ts`、`utils/formatters.ts`、`mocks/mockApprovalApi.ts`、`components/common/ApprovalTimeline.tsx`、`pages/RelicsPage.tsx`、`pages/DamagesPage.tsx`、`pages/DashboardPage.tsx`。

## 方案审批的“依据守护”规则

馆员可能在方案送审后改动文物状态或病害分级，为避免专家按旧依据通过方案，平台在前后端执行同一套规则：

1. **送审固化依据**：方案送审（`POST /api/restoration-plan/:id/submit`）时记录当时的文物 `current_condition`、病害 `severity` 与内容版本 `content_version`。
2. **任一项变化即清空待审意见**：馆员通过 `PATCH /api/relic-item/:id/condition` 或 `PATCH /api/damage-record/:id/severity` 改动后，该文物所有 `SUBMITTED` 方案立即被标记 `basis_stale=true`，差异写入 `basis_changes` 并标出是“文物状态”还是“病害分级”变化；当前版本未作废的专家意见全部作废（保留记录，标记作废原因），专家在重新送审前不能再出具意见。
3. **脆弱/封存双专家**：送审时文物状态为 `FRAGILE` 或 `SEALED` 时 `required_approvals=2`，且必须是两名不同专家（同专家重复同意返回 `PLAN_DUPLICATE_EXPERT`）；其他状态 1 名即可。满足同意人数自动通过，任一有效驳回即驳回。
4. **内容改版重新收集意见**：修复师通过 `PATCH /api/restoration-plan/:id/content` 修改标题/方法/风险评估后，`content_version+1`、方案回 `DRAFT`、旧版本意见全部以 `CONTENT` 原因作废；需重新送审（`POST /api/restoration-plan/:id/resubmit`）后重新收集意见。
5. **审批记录可追溯**：方案详情返回 `{ plan, opinions, approval }`，其中包含送审依据快照、变化项（from→to）、每条意见（含已作废意见与作废原因、对应内容版本）、已同意专家 id 列表与“还差几名专家”。前端统一由 `ApprovalTimeline` 展示。
6. **RBAC**：状态/分级维护需 `LIBRARIAN`，送审/改版/重新送审需 `RESTORER`，出具意见需 `EXPERT`（请求头 `x-role/x-user-id/x-user-name`，`ADMIN` 放行）。后端不可达时前端 `mocks/mockApprovalApi.ts` 会在会话内执行同一套规则。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
