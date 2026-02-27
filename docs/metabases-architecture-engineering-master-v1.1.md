# MetaBases – Architecture & Engineering Master Document v1.1

---
## Part 1 – Functional Design Specification (FDS)
---

# MetaBases – Functional Design Specification (FDS) v1.1 (Bot-Ready)

---

## 1. Purpose

MetaBases is a web-based reporting and dashboard platform that enables organizations to:

- Connect to approved data sources  
- Build queries and governed semantic models  
- Design dashboards  
- Manage secure access  
- Schedule and distribute reports  
- Embed analytics securely  

The platform supports both **self-service analytics** and **governed enterprise reporting**, suitable for regulated and mission-critical environments.

---

## 2. Scope

### In Scope

- Web UI for query authoring (SQL + visual builder)
- Data source management (connect, test, metadata sync)
- Lightweight semantic layer (models, metrics, dimensions)
- Dashboards, charts, filters, drill-through
- Scheduling, subscriptions, exports
- RBAC + row-level access rules (RLS) + audit logging
- Secure embedding in external apps
- REST API for automation and integration
- Multi-tenant support

### Out of Scope (v1)

- ML/AI insight generation
- ETL/ELT engine
- Pixel-perfect document designer

---

## 3. Definitions

- **Tenant / Workspace**: Isolated logical environment
- **Collection / Folder**: Container for questions, dashboards, models
- **Question**: Saved query + visualization config
- **Dashboard**: Composition of questions + filters
- **Model**: Governed dataset abstraction
- **Metric**: Reusable calculated measure

---

## 4. Personas & Roles

### Personas

- PlatformAdmin
- TenantAdmin
- DataAdmin
- ContentAdmin
- Analyst
- Viewer
- ServiceAccount

Roles are additive; effective permissions are union + explicit denies.

---

## 5. High-Level User Journeys

### 5.1 Connect Data Source

1. TenantAdmin adds connection
2. System validates connectivity
3. Metadata sync imports catalog
4. Admin marks approved objects
5. Analysts build models and questions

### 5.2 Build Dashboard

1. Analyst creates Question
2. Configures visualization
3. Saves to collection
4. Adds cards to Dashboard
5. Adds filters
6. Publishes and shares

### 5.3 Schedule Report

1. Select Question/Dashboard
2. Configure cron schedule
3. Choose delivery method
4. System generates and distributes report

---

## 6. Functional Requirements

### 6.1 Authentication & Identity

- Local authentication (email/password)
- MFA (TOTP baseline)
- OIDC SSO (enterprise mode)
- JWT access + refresh tokens
- Session timeout and forced logout
- Service accounts with scoped permissions

---

### 6.2 Authorization (RBAC + ABAC)

RBAC controls capabilities.  
ABAC enforces Row-Level Security (RLS).

RLS examples:

SQL:
```
SiteId IN (@AllowedSiteIds)
```

MongoDB:
```
{ siteId: { $in: @AllowedSiteIds } }
```

Default role for new users: Viewer.

---

### 6.3 Data Sources

Supported (v1):

- SQL Server
- PostgreSQL
- MySQL / MariaDB
- MongoDB

Connection security:

- TLS required
- Secrets encrypted at rest
- Optional KMS integration

Governance:

- Allow/deny schema lists
- Sensitivity labels
- PII flags

---

### 6.4 Query Authoring

#### SQL Editor

- Multi-statement disabled by default
- Strict parameter binding
- Query linting
- Execution limits (rows, timeout, payload)

#### Visual Builder

- Model-driven field selection
- Filters and grouping
- SQL generation behind the scenes

---

### 6.5 Semantic Layer

Models map to:

- SQL table/view
- Saved SQL query
- Mongo collection

Includes:

- Curated fields
- Metrics
- Optional joins
- RLS policies

---

### 6.6 Dashboards

Chart types:

- Table
- KPI
- Time series
- Bar
- Pie
- Scatter
- Map (optional)

Features:

- Grid layout
- Global filters
- Drill-down
- Drill-through
- Tenant theming

---

### 6.7 Exports & Distribution

Formats:

- CSV
- XLSX
- JSON
- PDF / PNG (server-rendered)

Delivery:

- Email (SMTP)
- Webhook (HMAC signed)

Retention policies configurable per tenant.

---

### 6.8 Sharing & Embedding

- Authenticated sharing
- Public sharing disabled by default
- Signed embed tokens
- Allowed origins (CORS)
- Embed-level permissions

Audit logs capture embed usage and exports.

---

### 6.9 Admin & Monitoring

Admin portal includes:

- Tenant management
- Users/groups/roles
- Data source status
- Job queues
- System health
- Operational metrics

---

### 6.10 Audit Logging (Mandatory)

Audit events:

- Authentication events
- Admin changes
- Query execution metadata
- Export generation
- Schedule runs
- Content changes

Audit logs are append-only and exportable.

---

## 7. Non-Functional Requirements

### Performance

- P95 API initiation < 500ms
- Cached dashboard load < 2s
- Concurrency baseline per tenant:
  - 200 viewers
  - 20 analysts
  - 10 schedulers

### Scalability

- Stateless API layer
- Independent worker scaling
- Redis caching
- Rate limiting per tenant

### Reliability

- Active-active API nodes
- N+1 workers
- Graceful degradation strategies

### Security

- TLS everywhere
- Secrets encryption
- OWASP protections
- CSP for embedded mode
- Strict parameter validation

### Compliance

- Immutable audit logs
- Configurable retention
- Optional data masking (v1.1)

---

## 8. System Architecture

Components:

- Vue3 SPA
- Core .NET 10 API
- Query Execution module
- Metadata Sync worker
- Scheduler worker
- Renderer service (Chromium)
- Audit service
- Auth service

Storage:

- PostgreSQL (recommended metadata DB)
- Redis cache
- S3-compatible object store

User data sources remain external.

---

## 9. Platform Metadata Model (Minimum Tables)

- tenants
- users, groups, user_groups
- roles, permissions, role_permissions, user_roles
- data_sources, data_source_secrets
- catalog_objects, catalog_fields
- models, model_fields, model_metrics, model_rls_policies
- questions
- dashboards, dashboard_cards, dashboard_filters
- schedules, jobs, job_runs
- exports
- audit_events (append-only)

All objects include:

- id
- tenant_id
- created_at
- created_by
- updated_at
- updated_by
- version

---

## 10. REST API Summary

Auth:

- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET /auth/me

Data Sources:

- POST /data-sources
- POST /data-sources/{id}/test
- POST /data-sources/{id}/sync

Models:

- POST /models
- GET /models/{id}
- PUT /models/{id}

Queries:

- POST /queries/run
- POST /questions
- POST /questions/{id}/run

Dashboards:

- POST /dashboards
- GET /dashboards/{id}
- POST /dashboards/{id}/render

Scheduling:

- POST /schedules
- GET /schedules/{id}/runs

Embedding:

- POST /embed/tokens
- GET /embed/dashboards/{id}

Audit:

- GET /audit/events

All APIs require:

- Tenant context
- RBAC enforcement
- Audit logging of sensitive actions

---

## 11. UI Screens

- Login (Local + SSO)
- Tenant switcher
- Data source management
- Model editor
- Query Studio (SQL + Visual)
- Dashboard builder
- Scheduler management
- Admin panel
- Audit explorer

---

## 12. Governance Rules

- No public sharing by default
- No raw SQL for non-analysts
- Exports permission-based
- Parameterization mandatory
- Row/runtime limits enforced
- Optional approval workflow (v1.1)

---

## 13. Testing Requirements

### Functional

- Role-based access tests
- RLS enforcement tests
- Export + scheduling tests

### Security

- OWASP Top 10 coverage
- SSRF/XSS/CSRF checks
- Secrets encryption validation

### Performance

- Concurrent dashboard load tests
- Scheduler stress tests
- Cache hit/miss verification

---

## 14. Deployment

Environments:

- Dev
- QA
- Staging
- Production

Deployment:

- Containerized (Kubernetes/Docker Compose recommended)
- VM-based supported (Windows/Linux)

Observability:

- Structured logs
- Prometheus metrics
- OpenTelemetry tracing

---

## 15. Acceptance Criteria

- SSO login functional
- Data source sync operational
- RLS enforced
- Dashboards with filters & drill-down functional
- Export and scheduling reliable
- Audit logs capture all critical actions
- HA supported with multiple API and worker nodes

---

## 16. Roadmap

v1.1:

- Approval workflow
- Data masking
- Dashboard versioning

v1.2:

- Template-based reporting

v2:

- AI-assisted query building
- Anomaly detection
- Data lineage


---
---

## Part 2 – Implementation Blueprint (Bot-Ready)
---

# MetaBases – Bot-ready Implementation Pack v1.1

> Paste this into agentic coding bots. It includes repo layout, coding standards, core interfaces, API DTO contracts, and a platform metadata DB schema (SQL-first, EF Core–friendly).  
> Tailored for: **.NET 10 / C# 14**, **Vue 3**, **multi-tenant**, **SQL Server/PostgreSQL/MySQL/MariaDB/MongoDB**, **RBAC + RLS**, **audit**, **scheduling**, **exports**, **embedding**.

---

## 1) Monorepo structure (implementation-ready)

```text
metabases/
  README.md
  docker/
    docker-compose.dev.yml
    docker-compose.prod.example.yml
    nginx/
      nginx.conf
  docs/
    fds-v1.1.md
    api-openapi.yaml
    rls-examples.md
    security-controls.md
  src/
    backend/
      MetaBases.sln
      Directory.Build.props
      Directory.Packages.props

      MetaBases.Api/                    # ASP.NET Core API (Minimal APIs recommended)
        Program.cs
        appsettings.json
        appsettings.Development.json
        Middleware/
        Endpoints/
          Auth/
          Tenants/
          Users/
          Groups/
          Roles/
          DataSources/
          Catalog/
          Models/
          Queries/
          Questions/
          Dashboards/
          Schedules/
          Embeds/
          Audit/
          Health/
        OpenApi/
        Filters/
        Security/

      MetaBases.Application/            # Use-cases, handlers, policies
        Abstractions/
        Auth/
        Tenancy/
        Authorization/
        DataSources/
        Catalog/
        Models/
        Queries/
        Dashboards/
        Scheduling/
        Exports/
        Audit/
        Validation/

      MetaBases.Domain/                 # Entities + value objects
        Tenancy/
        Identity/
        Governance/
        Content/
        Scheduling/
        Auditing/
        Common/

      MetaBases.Infrastructure/         # EF Core, encryption, Redis, connectors, object storage
        Persistence/
          MetaBasesDbContext.cs
          Configurations/
          Migrations/
        Tenancy/
        Security/
          Encryption/
          Token/
        Caching/
        ObjectStorage/
        Connectors/
          SqlServer/
          Postgres/
          MySql/
          Mongo/
        QueryExecution/
          Sql/
          Mongo/
        Rendering/
        Scheduling/
        Observability/

      MetaBases.Worker/                 # Background jobs: scheduler, sync, exports, retention
        Program.cs
        Jobs/
          CatalogSyncJob.cs
          ScheduleRunJob.cs
          ExportRenderJob.cs
          RetentionPurgeJob.cs

      MetaBases.Shared/                 # Shared DTOs, contracts, error model
        Dtos/
        Errors/
        Paging/
        Serialization/

      tests/
        MetaBases.Tests.Unit/
        MetaBases.Tests.Integration/
        MetaBases.Tests.Security/
        MetaBases.Tests.Performance/

    frontend/
      metabases-ui/
        package.json
        vite.config.ts
        src/
          main.ts
          router/
          stores/
          api/
          components/
          pages/
          layouts/
          composables/
          styles/
        e2e/
```

**Why this layout works for bots:** each module maps to a folder and a set of endpoints + use-cases + infrastructure adapters, so task agents can work in parallel without collision.

---

## 2) Hard coding standards (bots must follow)

### Backend (.NET)

**Multi-tenancy is enforced server-side:**
- Every tenant-owned table includes `tenant_id`.
- Every query against platform metadata is filtered by tenant scope.
- Tenant resolved from `X-Tenant-Id` header OR subdomain OR JWT claim `tid`.

**Authorization:**
- RBAC checks at endpoint boundary + in application use-cases.
- “Union roles + explicit denies” supported via `permission_denies` table.

**Query safety:**
- No string concatenation for SQL parameters.
- Default: deny DDL/DML keywords; allow overrides by policy (tenant setting).
- Enforce `maxRows`, `timeoutMs`, `maxBytes`.

**Audit:**
- Any sensitive action writes an append-only audit event.

**Errors:**
- Single error envelope (`ProblemDetails` + `errorCode` + `traceId`).

**Migrations:**
- EF Core migrations in `MetaBases.Infrastructure/Persistence/Migrations`.

### Frontend (Vue 3)

- Use typed API clients (OpenAPI-generated preferred).
- Route guards based on `/auth/me` and permission claims.
- Keep “builder” features behind permissions (no security reliance on UI).

---

## 3) Core contracts (interfaces bots implement first)

### Tenancy

```csharp
public interface ITenantContext
{
    Guid TenantId { get; }
    string? TenantKey { get; } // optional: subdomain key
}

public interface ITenantResolver
{
    ValueTask<ITenantContext> ResolveAsync(HttpContext httpContext, CancellationToken ct);
}
```

### Authorization (RBAC + Denies)

```csharp
public interface IAuthorizationService
{
    ValueTask EnsureAsync(
        ClaimsPrincipal user,
        Guid tenantId,
        Permission required,
        CancellationToken ct);

    ValueTask<bool> HasAsync(
        ClaimsPrincipal user,
        Guid tenantId,
        Permission required,
        CancellationToken ct);
}
```

### Data source connectors

```csharp
public enum DataSourceType { SqlServer, Postgres, MySql, MariaDb, MongoDb }

public interface IDataSourceConnector
{
    DataSourceType Type { get; }
    Task<TestConnectionResult> TestAsync(DataSourceConnection connection, CancellationToken ct);
    Task<CatalogSnapshot> SyncCatalogAsync(DataSourceConnection connection, CatalogSyncOptions options, CancellationToken ct);
    Task<QueryResult> ExecuteAsync(CompiledQuery query, CancellationToken ct);
}
```

### Query compilation + RLS enforcement

```csharp
public interface IQueryCompiler
{
    Task<CompiledQuery> CompileAsync(QueryDefinition definition, QueryCompileContext context, CancellationToken ct);
}

public interface IRlsPolicyEnforcer
{
    Task<CompiledQuery> ApplyAsync(CompiledQuery compiled, RlsContext rls, CancellationToken ct);
}
```

### Exports + rendering

```csharp
public interface IExportRenderer
{
    Task<RenderResult> RenderDashboardPdfAsync(DashboardRenderRequest req, CancellationToken ct);
    Task<RenderResult> RenderDashboardPngAsync(DashboardRenderRequest req, CancellationToken ct);
}

public interface IObjectStorage
{
    Task<StoredObjectRef> PutAsync(string key, Stream content, string contentType, CancellationToken ct);
    Task<Stream> GetAsync(string key, CancellationToken ct);
    Task DeleteAsync(string key, CancellationToken ct);
}
```

### Audit append-only

```csharp
public interface IAuditWriter
{
    Task AppendAsync(AuditEventWrite evt, CancellationToken ct);
}
```

---

## 4) REST API DTO contracts (bot-ready)

> All endpoints require tenant context (header/subdomain/token). All responses include `traceId`.

### Common envelopes

**Error envelope (ProblemDetails + extensions)**

```json
{
  "type": "https://errors.metabases.local/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "Missing permission: dashboards.view",
  "traceId": "00-acde..."
}
```

### Auth

**POST /auth/login**

Request:

```json
{ "email": "a@b.com", "password": "********", "tenantKey": "acme" }
```

Response:

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "expiresInSeconds": 900,
  "user": { "id":"...", "email":"...", "displayName":"...", "roles":["Analyst"], "permissions":["questions.create"] },
  "tenant": { "id":"...", "key":"acme", "name":"Acme" }
}
```

**GET /auth/me**

```json
{
  "user": {
    "id":"...", "email":"...", "displayName":"...",
    "roles":["Analyst"],
    "permissions":[ "dashboards.view", "questions.run" ],
    "groups":[ { "id":"...", "name":"UAE-Region-A" } ],
    "claims": { "department":"Ops", "siteIds":["...","..."] }
  },
  "tenant": { "id":"...", "key":"acme", "name":"Acme" }
}
```

### Data sources

**POST /data-sources**

```json
{
  "name": "Primary SQL",
  "type": "SqlServer",
  "connection": {
    "host":"db01", "port":1433, "database":"PSModules",
    "sslMode":"Required",
    "username":"svc_metabases",
    "password":"***"
  },
  "governance": {
    "approvedSchemas":["dbo","reporting"],
    "deniedSchemas":["sys"],
    "defaultSensitivity":"Internal"
  }
}
```

**POST /data-sources/{id}/sync**

```json
{ "mode":"Full", "includeSamples": false }
```

### Models

**POST /models**

```json
{
  "name":"Alarm Summary",
  "dataSourceId":"...",
  "kind":"SqlTable",
  "source": { "schema":"reporting", "object":"vw_alarm_summary" },
  "fields":[
    { "name":"siteId", "type":"Guid", "visible":true, "pii":false, "sensitivity":"Internal" },
    { "name":"status", "type":"String", "visible":true }
  ],
  "metrics":[
    { "name":"TotalAlarms", "expression":"count(*)", "format":"0" }
  ],
  "rlsPolicy": {
    "mode":"SqlPredicate",
    "predicateTemplate":"siteId IN (@AllowedSiteIds)"
  }
}
```

### Query run (ad-hoc)

**POST /queries/run**

```json
{
  "dataSourceId":"...",
  "language":"Sql",
  "text":"SELECT * FROM reporting.vw_alarm_summary WHERE created_at >= @startDate",
  "parameters":[ { "name":"startDate", "type":"DateTime", "value":"2026-02-01T00:00:00Z" } ],
  "limits": { "timeoutMs": 30000, "maxRows": 5000 }
}
```

### Questions & dashboards

- **POST /questions/{id}/run** (similar to `/queries/run`, but uses saved definition + viz config)

**POST /dashboards/{id}/render**

```json
{ "format":"PDF", "filters": { "siteId":"...", "startDate":"..." } }
```

### Scheduling

**POST /schedules**

```json
{
  "name":"Daily Ops PDF",
  "target": { "type":"Dashboard", "id":"..." },
  "cron":"0 7 * * *",
  "timezone":"Asia/Dubai",
  "delivery": {
    "mode":"Email",
    "recipients":[ "ops@acme.com" ],
    "subject":"Daily Ops Dashboard",
    "format":"PDF"
  },
  "retentionDays": 90
}
```

### Embedding

**POST /embed/tokens**

```json
{
  "dashboardId":"...",
  "expiresInSeconds": 600,
  "allowedActions":[ "view" ],
  "allowedOrigins":[ "https://portal.acme.com" ],
  "guestClaims": { "siteIds":["..."] }
}
```

---

## 5) Platform metadata DB schema (SQL-first, EF-friendly)

> Minimum viable schema that covers tenancy, identity, RBAC+denies, data sources, catalog, semantic layer, content, scheduling, exports, and audit.

### Tenancy + identity

- `tenants(id, key, name, status, created_at, ...)`
- `users(id, tenant_id, email, display_name, password_hash, auth_provider, is_active, last_login_at, ...)`
- `groups(id, tenant_id, name, ...)`
- `user_groups(user_id, group_id, tenant_id, ...)`

### RBAC

- `roles(id, tenant_id, name, is_system, ...)`
- `permissions(code, description)` (global seed; not tenant-scoped)
- `role_permissions(role_id, permission_code, tenant_id, ...)`
- `user_roles(user_id, role_id, tenant_id, ...)`
- `permission_denies(id, tenant_id, subject_type, subject_id, permission_code, reason, ...)`

`subject_type`: `User|Group|Role`

### Data sources + secrets

- `data_sources(id, tenant_id, name, type, config_json, governance_json, status, ...)`
- `data_source_secrets(id, tenant_id, data_source_id, encrypted_blob, key_id, rotated_at, ...)`

### Catalog

- `catalog_objects(id, tenant_id, data_source_id, object_type, schema_name, object_name, is_approved, sensitivity, ...)`
  - `object_type`: `Schema|Table|View|Collection`
- `catalog_fields(id, tenant_id, catalog_object_id, field_name, field_type, is_nullable, sensitivity, pii_flag, ...)`

### Semantic layer

- `models(id, tenant_id, data_source_id, name, kind, source_json, is_published, ...)`
- `model_fields(id, tenant_id, model_id, name, type, format, visible, description, sensitivity, pii_flag, ...)`
- `model_metrics(id, tenant_id, model_id, name, expression, format, ...)`
- `model_rls_policies(id, tenant_id, model_id, mode, template, json_rules, ...)`

### Content

- `collections(id, tenant_id, parent_id, name, path, ...)`
- `questions(id, tenant_id, collection_id, name, definition_json, viz_json, is_published, version, ...)`
- `dashboards(id, tenant_id, collection_id, name, layout_json, is_published, version, ...)`
- `dashboard_cards(id, tenant_id, dashboard_id, question_id, position_json, overrides_json, ...)`
- `dashboard_filters(id, tenant_id, dashboard_id, definition_json, ...)`

### Scheduling + jobs

- `schedules(id, tenant_id, name, target_json, cron, timezone, delivery_json, is_enabled, ...)`
- `jobs(id, tenant_id, type, payload_json, status, run_at, ...)`
- `job_runs(id, tenant_id, job_id, started_at, finished_at, status, error_json, ...)`

### Exports

- `exports(id, tenant_id, target_json, format, object_key, size_bytes, checksum, created_at, expires_at, ...)`

### Audit (append-only)

- `audit_events(id, tenant_id, at, type, actor_user_id, actor_type, ip, user_agent, object_type, object_id, metadata_json)`

Optional integrity:
- `audit_hash_chain(tenant_id, last_hash, ...)` or store `prev_hash` and `hash` columns on `audit_events`.

### Indexes bots should create early (load-bearing)

- Every table: `(tenant_id, id)` clustered/primary pattern
- `users(tenant_id, email)` unique
- `audit_events(tenant_id, at desc)`, `audit_events(tenant_id, type, at desc)`
- `jobs(tenant_id, status, run_at)`
- `exports(tenant_id, created_at desc)`

---

## 6) Endpoint-to-permission mapping (bots can codify)

Define permission codes like:

- `tenants.manage`
- `users.manage`
- `roles.manage`
- `datasources.manage`
- `catalog.view`
- `models.create`, `models.edit`, `models.view`
- `questions.create`, `questions.edit`, `questions.view`, `questions.run`
- `dashboards.create`, `dashboards.edit`, `dashboards.view`, `dashboards.render`, `dashboards.export`
- `schedules.manage`, `schedules.run`
- `embed.create`, `embed.view`
- `audit.view`

Default roles seed (per tenant):

- **TenantAdmin:** `*.manage` + `audit.view`
- **DataAdmin:** `datasources.manage`, `catalog.*`, `models.*`
- **Analyst:** `models.view`, `questions.*`, `dashboards.*` (no manage users/roles)
- **Viewer:** `questions.view/run`, `dashboards.view`, (export optional)
- **ServiceAccount:** explicit scopes, minimal

Add `permission_denies` to support “union + explicit deny”.

---

## 7) Bot task breakdown (first sprint that unblocks everything)

1) **Tenancy middleware + tenant-scoped DbContext**
- `ITenantResolver`, `TenantContext`, global query filters
- Reject missing tenant context

2) **Auth**
- Local login + refresh + logout
- OIDC stub (config + endpoints) even if not enabled by default

3) **RBAC + denies**
- Permission seed table
- Role seed per tenant bootstrap
- Endpoint guard attribute/filter

4) **Audit writer**
- Append-only writes
- Wrap all admin endpoints + auth events first

5) **Data source connectors**
- Implement test + minimal query execution for each connector
- Secrets encryption abstraction

6) **Catalog sync**
- SQL: `INFORMATION_SCHEMA` / sys catalog per DB
- Mongo: list collections + sample N docs for fields (configurable)

Once these 6 land, the rest (models/questions/dashboards/scheduler/renderer) becomes “feature work” rather than “platform plumbing”.

---

## Next optional deliverables

If you want, extend this pack with:
- (a) an OpenAPI 3.1 spec matching these DTOs
- (b) a complete EF Core entity set (Domain + Infrastructure mappings)
- (c) a Docker Compose dev stack (Postgres + Redis + MinIO + Worker + Renderer)


---

# End of Master Document
