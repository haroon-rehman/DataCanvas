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
