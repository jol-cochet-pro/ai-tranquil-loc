# Graph Report - /home/cooper/Documents/pro/ai-tranquil-loc  (2026-06-07)

## Corpus Check
- 120 files · ~64,720 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1290 nodes · 1435 edges · 65 communities (44 shown, 21 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.82)
- Token cost: 5,200 input · 480 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Personne Prisma Types|Personne Prisma Types]]
- [[_COMMUNITY_Prisma Namespace Core|Prisma Namespace Core]]
- [[_COMMUNITY_StatutDocumentType Model|StatutDocumentType Model]]
- [[_COMMUNITY_Dossier Model|Dossier Model]]
- [[_COMMUNITY_Statut Model|Statut Model]]
- [[_COMMUNITY_Document Model|Document Model]]
- [[_COMMUNITY_Auth Backend|Auth Backend]]
- [[_COMMUNITY_DocumentType Model|DocumentType Model]]
- [[_COMMUNITY_Account Model|Account Model]]
- [[_COMMUNITY_Frontend API Client|Frontend API Client]]
- [[_COMMUNITY_Frontend Dependencies|Frontend Dependencies]]
- [[_COMMUNITY_Backend TypeScript Config|Backend TypeScript Config]]
- [[_COMMUNITY_Linting & Dev Tools|Linting & Dev Tools]]
- [[_COMMUNITY_ADR & Configuration|ADR & Configuration]]
- [[_COMMUNITY_Prisma Input Types|Prisma Input Types]]
- [[_COMMUNITY_Skills Registry|Skills Registry]]
- [[_COMMUNITY_TDD & Testing Philosophy|TDD & Testing Philosophy]]
- [[_COMMUNITY_Prisma CLI Commands|Prisma CLI Commands]]
- [[_COMMUNITY_Domain Model Concepts|Domain Model Concepts]]
- [[_COMMUNITY_Frontend TypeScript Config|Frontend TypeScript Config]]
- [[_COMMUNITY_Backend Dependencies|Backend Dependencies]]
- [[_COMMUNITY_Prisma Browser Namespace|Prisma Browser Namespace]]
- [[_COMMUNITY_NPM Scripts|NPM Scripts]]
- [[_COMMUNITY_Application Entry Points|Application Entry Points]]
- [[_COMMUNITY_Prisma Browser Exports|Prisma Browser Exports]]
- [[_COMMUNITY_Jest Test Config|Jest Test Config]]
- [[_COMMUNITY_Prisma Client Exports|Prisma Client Exports]]
- [[_COMMUNITY_App Controller|App Controller]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Prisma Client Class|Prisma Client Class]]
- [[_COMMUNITY_Domain Model Documentation|Domain Model Documentation]]
- [[_COMMUNITY_E2E Test Configuration|E2E Test Configuration]]
- [[_COMMUNITY_NestJS CLI Config|NestJS CLI Config]]
- [[_COMMUNITY_Frontend Auth Pages|Frontend Auth Pages]]
- [[_COMMUNITY_Domain Enums & Models|Domain Enums & Models]]
- [[_COMMUNITY_Auth DTOs|Auth DTOs]]
- [[_COMMUNITY_Build Config|Build Config]]
- [[_COMMUNITY_TypeScript Project Refs|TypeScript Project Refs]]
- [[_COMMUNITY_Grill With Docs Skill|Grill With Docs Skill]]
- [[_COMMUNITY_Static Assets|Static Assets]]
- [[_COMMUNITY_Auth Context|Auth Context]]
- [[_COMMUNITY_Auth Response DTO|Auth Response DTO]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_PRD Skills|PRD Skills]]
- [[_COMMUNITY_Prisma MCP|Prisma MCP]]
- [[_COMMUNITY_Prisma --config Flag|Prisma --config Flag]]
- [[_COMMUNITY_Monorepo Layout|Monorepo Layout]]
- [[_COMMUNITY_Red-Green-Refactor Cycle|Red-Green-Refactor Cycle]]
- [[_COMMUNITY_Workflow Instructions|Workflow Instructions]]
- [[_COMMUNITY_Client Brief|Client Brief]]
- [[_COMMUNITY_Prisma Namespace|Prisma Namespace]]
- [[_COMMUNITY_Prisma Namespace Browser|Prisma Namespace Browser]]
- [[_COMMUNITY_App E2E Test|App E2E Test]]
- [[_COMMUNITY_Jest E2E Config|Jest E2E Config]]
- [[_COMMUNITY_App Module|App Module]]
- [[_COMMUNITY_Prisma CLI Skill|Prisma CLI Skill]]
- [[_COMMUNITY_Icons SVG Sprite|Icons SVG Sprite]]
- [[_COMMUNITY_Hero Image|Hero Image]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `compilerOptions` - 17 edges
3. `compilerOptions` - 16 edges
4. `scripts` - 14 edges
5. `PersonneService` - 12 edges
6. `PrismaService` - 12 edges
7. `useAuth()` - 11 edges
8. `PRD.md (Product Requirements)` - 11 edges
9. `AuthService` - 10 edges
10. `Personne` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Integration-Style Tests` --semantically_similar_to--> `AppController Spec`  [INFERRED] [semantically similar]
  .agents/skills/tdd/tests.md → backend/src/app.controller.spec.ts
- `Integration-Style Tests` --semantically_similar_to--> `AuthService Spec`  [INFERRED] [semantically similar]
  .agents/skills/tdd/tests.md → backend/src/auth/auth.service.spec.ts
- `Pas de Consentement Garant Requis` --conceptually_related_to--> `Personne Model`  [INFERRED]
  docs/adr/0002-pas-consentement-garant.md → backend/generated/prisma/internal/class.ts
- `Backend ESLint Config` --semantically_similar_to--> `Frontend ESLint Config`  [INFERRED] [semantically similar]
  backend/eslint.config.mjs → frontend/eslint.config.js
- `Configuration API (Frontend)` --implements--> `Document`  [INFERRED]
  frontend/src/api/configuration.ts → CONTEXT.md

## Import Cycles
- 3-file cycle: `backend/generated/prisma/commonInputTypes.ts -> backend/generated/prisma/internal/prismaNamespace.ts -> backend/generated/prisma/models.ts -> backend/generated/prisma/commonInputTypes.ts`
- 3-file cycle: `backend/generated/prisma/internal/prismaNamespace.ts -> backend/generated/prisma/models.ts -> backend/generated/prisma/models/Account.ts -> backend/generated/prisma/internal/prismaNamespace.ts`
- 3-file cycle: `backend/generated/prisma/internal/prismaNamespace.ts -> backend/generated/prisma/models.ts -> backend/generated/prisma/models/Document.ts -> backend/generated/prisma/internal/prismaNamespace.ts`
- 3-file cycle: `backend/generated/prisma/internal/prismaNamespace.ts -> backend/generated/prisma/models.ts -> backend/generated/prisma/models/DocumentType.ts -> backend/generated/prisma/internal/prismaNamespace.ts`
- 3-file cycle: `backend/generated/prisma/internal/prismaNamespace.ts -> backend/generated/prisma/models.ts -> backend/generated/prisma/models/Dossier.ts -> backend/generated/prisma/internal/prismaNamespace.ts`
- 3-file cycle: `backend/generated/prisma/internal/prismaNamespace.ts -> backend/generated/prisma/models.ts -> backend/generated/prisma/models/Personne.ts -> backend/generated/prisma/internal/prismaNamespace.ts`
- 3-file cycle: `backend/generated/prisma/internal/prismaNamespace.ts -> backend/generated/prisma/models.ts -> backend/generated/prisma/models/Statut.ts -> backend/generated/prisma/internal/prismaNamespace.ts`
- 3-file cycle: `backend/generated/prisma/internal/prismaNamespace.ts -> backend/generated/prisma/models.ts -> backend/generated/prisma/models/StatutDocumentType.ts -> backend/generated/prisma/internal/prismaNamespace.ts`

## Hyperedges (group relationships)
- **Development Setup Workflow** — init, dev, migrate_dev, generate, db_seed, studio [EXTRACTED 1.00]
- **Production Migration Workflow** — migrate_dev, migrate_deploy, migrate_status, migrate_resolve [EXTRACTED 1.00]
- **Database-First Workflow** — init, db_pull, generate [EXTRACTED 1.00]
- **Prisma Domain Data Model** — model_account, model_dossier, model_personne, model_document, model_document_type, model_statut, model_statut_document_type [EXTRACTED 1.00]
- **JWT Authentication Feature** — auth-modulets_AuthModule, auth-controllerts_AuthController, auth-servicets_AuthService, jwt-auth-guardts_JwtAuthGuard, jwt-strategyts_JwtStrategy, auth-servicets_PrismaService, auth-servicets_JwtService, auth-servicets_BCrypt [EXTRACTED 1.00]
- **TDD Workflow** — SKILLmd_RedGreenRefactor, SKILLmd_VerticalSlices, deep-modulesmd_DeepModule, interface-designmd_InterfaceTestability, mockingmd_SystemBoundaryMocking, refactoringmd_RefactorCandidates, testsmd_IntegrationTests, mockingmd_DependencyInjection [EXTRACTED 1.00]
- **Domain Data Model** — models.ts_Account, models.ts_Dossier, models.ts_Personne, models.ts_Document, enums.ts_TypeLogement [EXTRACTED 1.00]
- **Personne Backend Module** — controller_personne_backend, service_personne_backend, module_personne_backend, spec_personneservice_backend [EXTRACTED 1.00]
- **Dossier Locatif Domain Model** — concept_candidat_locataire, concept_dossier, concept_garant, concept_co_candidat, concept_document, concept_personne, concept_invitation, concept_transmission [EXTRACTED 1.00]
- **Frontend Authentication System** — page_login_frontend, page_signup_frontend, page_protectedroute_frontend, api_auth_frontend, api_client_frontend [INFERRED 0.85]
- **Authentication API Contract** — login_dto, register_dto, auth_response_dto [INFERRED 0.85]
- **Configuration Feature Module** — configuration_controller, configuration_service, configuration_module, prisma_service, statut_model, document_type_model [INFERRED 0.90]
- **Reusable Dossier Architecture** — dossier_reutilisable_concept, transmission_link_concept, dossier_model, adr_0001_dossier_reutilisable [EXTRACTED 1.00]
- **PRD Workflow Pipeline** — writeprd_skill, prdtoissues_skill [INFERRED 0.80]
- **Frontend Static Assets** — favicon_svg, icons_svg, hero_png, react_logo, vite_logo [INFERRED 0.75]
- **Frontend Authentication System** — authcontext_tsx, authapi_module [INFERRED 0.85]

## Communities (65 total, 21 thin omitted)

### Community 0 - "Personne Prisma Types"
Cohesion: 0.02
Nodes (114): AggregatePersonne, EnumTypeLogementFieldUpdateOperationsInput, GetPersonneAggregateType, GetPersonneGroupByPayload, NullableIntFieldUpdateOperationsInput, NullableStringFieldUpdateOperationsInput, Personne$documentsArgs, PersonneAggregateArgs (+106 more)

### Community 1 - "Prisma Namespace Core"
Cohesion: 0.02
Nodes (108): AccountScalarFieldEnum, Args, At, AtLeast, AtLoose, AtStrict, BatchPayload, Boolean (+100 more)

### Community 2 - "StatutDocumentType Model"
Cohesion: 0.02
Nodes (91): AggregateStatutDocumentType, GetStatutDocumentTypeAggregateType, GetStatutDocumentTypeGroupByPayload, Prisma__StatutDocumentTypeClient, StatutDocumentTypeAggregateArgs, StatutDocumentTypeCountAggregateInputType, StatutDocumentTypeCountAggregateOutputType, StatutDocumentTypeCountArgs (+83 more)

### Community 3 - "Dossier Model"
Cohesion: 0.02
Nodes (84): AggregateDossier, Dossier$personnesArgs, DossierAggregateArgs, DossierCountAggregateInputType, DossierCountAggregateOutputType, DossierCountArgs, DossierCountOrderByAggregateInput, DossierCountOutputType (+76 more)

### Community 4 - "Statut Model"
Cohesion: 0.02
Nodes (83): AggregateStatut, GetStatutAggregateType, GetStatutGroupByPayload, Prisma__StatutClient, Statut$personnesArgs, Statut$statutDocumentTypesArgs, StatutAggregateArgs, StatutCountAggregateInputType (+75 more)

### Community 5 - "Document Model"
Cohesion: 0.02
Nodes (82): AggregateDocument, DocumentAggregateArgs, DocumentAvgAggregateInputType, DocumentAvgAggregateOutputType, DocumentAvgOrderByAggregateInput, DocumentCountAggregateInputType, DocumentCountAggregateOutputType, DocumentCountArgs (+74 more)

### Community 6 - "Auth Backend"
Cohesion: 0.05
Nodes (20): AuthController, AuthModule, AuthService, JwtAuthGuard, JwtStrategy, ConfigurationController, ConfigurationModule, ConfigurationService (+12 more)

### Community 7 - "DocumentType Model"
Cohesion: 0.03
Nodes (72): AggregateDocumentType, DocumentType$statutDocumentTypesArgs, DocumentTypeAggregateArgs, DocumentTypeCountAggregateInputType, DocumentTypeCountAggregateOutputType, DocumentTypeCountArgs, DocumentTypeCountOrderByAggregateInput, DocumentTypeCountOutputType (+64 more)

### Community 8 - "Account Model"
Cohesion: 0.03
Nodes (70): Account$dossierArgs, AccountAggregateArgs, AccountCountAggregateInputType, AccountCountAggregateOutputType, AccountCountArgs, AccountCountOrderByAggregateInput, AccountCreateArgs, AccountCreateInput (+62 more)

### Community 9 - "Frontend API Client"
Cohesion: 0.10
Nodes (25): authApi, AuthResponse, apiClient, configurationApi, DocumentType, Statut, CreatePersonneDto, Personne (+17 more)

### Community 10 - "Frontend Dependencies"
Cohesion: 0.05
Nodes (38): dependencies, axios, react, react-dom, react-router-dom, devDependencies, @babel/core, babel-plugin-react-compiler (+30 more)

### Community 11 - "Backend TypeScript Config"
Cohesion: 0.05
Nodes (35): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, experimentalDecorators, forceConsistentCasingInFileNames, incremental, module (+27 more)

### Community 12 - "Linting & Dev Tools"
Cohesion: 0.07
Nodes (30): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, jest (+22 more)

### Community 13 - "ADR & Configuration"
Cohesion: 0.10
Nodes (27): Account Model, ADR 0001 - Dossier Profil Reutilisable, ADR 0002 - Pas de Consentement Garant, Configuration Controller, Configuration Module, Configuration Service, Create Personne DTO, Document Model (+19 more)

### Community 14 - "Prisma Input Types"
Cohesion: 0.07
Nodes (27): DateTimeFilter, DateTimeWithAggregatesFilter, EnumTypeLogementFilter, EnumTypeLogementWithAggregatesFilter, IntFilter, IntNullableFilter, IntNullableWithAggregatesFilter, IntWithAggregatesFilter (+19 more)

### Community 15 - "Skills Registry"
Cohesion: 0.07
Nodes (26): computedHash, skillPath, source, sourceType, computedHash, skillPath, source, sourceType (+18 more)

### Community 16 - "TDD & Testing Philosophy"
Cohesion: 0.08
Nodes (26): A Philosophy of Software Design, Horizontal Slices Anti-Pattern, Test-Driven Development, Vertical Slices / Tracer Bullets, AppController Spec, AppController, AppModule, AppService (+18 more)

### Community 17 - "Prisma CLI Commands"
Cohesion: 0.15
Nodes (23): prisma db execute, prisma db, prisma db pull, prisma db push, prisma db seed, prisma debug, prisma dev, --force / -f (+15 more)

### Community 18 - "Domain Model Concepts"
Cohesion: 0.16
Nodes (21): Configuration API (Frontend), Personnes API (Frontend), Candidat Locataire, Co-candidat, Document, Dossier, Garant, Invitation (+13 more)

### Community 19 - "Frontend TypeScript Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 20 - "Backend Dependencies"
Cohesion: 0.12
Nodes (17): dependencies, bcrypt, class-transformer, class-validator, dotenv, @nestjs/common, @nestjs/core, @nestjs/jwt (+9 more)

### Community 21 - "Prisma Browser Namespace"
Cohesion: 0.13
Nodes (13): AccountScalarFieldEnum, DocumentScalarFieldEnum, DocumentTypeScalarFieldEnum, DossierScalarFieldEnum, ModelName, NullsOrder, NullTypes, PersonneScalarFieldEnum (+5 more)

### Community 22 - "NPM Scripts"
Cohesion: 0.14
Nodes (14): scripts, build, format, lint, start, start:debug, start:dev, start:prod (+6 more)

### Community 23 - "Application Entry Points"
Cohesion: 0.17
Nodes (12): Backend Application, Frontend Application, Frontend Main, Jest Testing, JWT Authentication, NestJS Framework, PostgreSQL Database, Prisma ORM (+4 more)

### Community 24 - "Prisma Browser Exports"
Cohesion: 0.20
Nodes (8): Account, Document, DocumentType, Dossier, Personne, Statut, StatutDocumentType, TypeLogement

### Community 25 - "Jest Test Config"
Cohesion: 0.22
Nodes (9): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+1 more)

### Community 26 - "Prisma Client Exports"
Cohesion: 0.22
Nodes (8): @prisma/client, Account, Document, DocumentType, Dossier, Personne, Statut, StatutDocumentType

### Community 28 - "Package Metadata"
Cohesion: 0.29
Nodes (6): author, description, license, name, private, version

### Community 29 - "Prisma Client Class"
Cohesion: 0.29
Nodes (4): config, LogOptions, PrismaClient, PrismaClientConstructor

### Community 30 - "Domain Model Documentation"
Cohesion: 0.33
Nodes (7): Account Model, Document Model, DocumentType Model, Dossier Model, Personne Model, Statut Model, StatutDocumentType Model

### Community 31 - "E2E Test Configuration"
Cohesion: 0.29
Nodes (6): moduleFileExtensions, rootDir, testEnvironment, testRegex, transform, ^.+\\.(t|j)s$

### Community 32 - "NestJS CLI Config"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 33 - "Frontend Auth Pages"
Cohesion: 0.40
Nodes (5): Auth API (Frontend), Axios API Client, Login Page, ProtectedRoute, Signup Page

### Community 34 - "Domain Enums & Models"
Cohesion: 0.40
Nodes (5): TypeLogement Enum, Account Model, Document Model, Dossier Model, Personne Model

### Community 35 - "Auth DTOs"
Cohesion: 0.67
Nodes (3): Auth Response DTO, Login DTO, Register DTO

### Community 38 - "Grill With Docs Skill"
Cohesion: 0.67
Nodes (3): ADR Format Document, CONTEXT Format Document, Grill With Docs Skill

### Community 39 - "Static Assets"
Cohesion: 0.67
Nodes (3): Favicon SVG, React Logo, Vite Logo

## Knowledge Gaps
- **1025 isolated node(s):** `Account`, `Dossier`, `Statut`, `DocumentType`, `StatutDocumentType` (+1020 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Backend Dependencies` to `Prisma Client Exports`, `Package Metadata`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `@prisma/client` connect `Prisma Client Exports` to `Backend Dependencies`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `jest` connect `Jest Test Config` to `Package Metadata`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `Account`, `Dossier`, `Statut` to the rest of the system?**
  _1025 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Personne Prisma Types` be split into smaller, more focused modules?**
  _Cohesion score 0.017391304347826087 - nodes in this community are weakly interconnected._
- **Should `Prisma Namespace Core` be split into smaller, more focused modules?**
  _Cohesion score 0.01834862385321101 - nodes in this community are weakly interconnected._
- **Should `StatutDocumentType Model` be split into smaller, more focused modules?**
  _Cohesion score 0.021739130434782608 - nodes in this community are weakly interconnected._