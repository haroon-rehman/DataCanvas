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
