# Project: Library Management System (图书管理系统)

## Tech Stack & Constraints (技术栈与硬性约束)
- **Backend**: Java 8, Spring Boot (Latest compatible with JDK 8), Spring Security, MyBatis Plus.
- **Frontend**: React (JSX syntax), Functional Components with Hooks, React Router v6, Axios, Ant Design (UI Library).
- **Database**: MySQL 8.0 (Port: 3306), Redis (Port: 6379).
- **Authentication**: JWT (JSON Web Token) stateless authentication.
- **Architecture**: 
  - Backend: RESTful API, RBAC (Role-Based Access Control) model.
  - Frontend: Dynamic routing based on user permissions.

## Database Initialization Strategy (数据库初始化策略)
- **One-time Auto Execution**: After all code generation is complete, you MUST automatically execute the SQL initialization script using the terminal (e.g., via `mysql` command line client).
- **Execution Timing**: This execution happens ONLY ONCE after the project scaffolding and SQL file generation are finished. Do NOT integrate this into the application startup lifecycle (avoid `spring.datasource.schema` or `data.sql`).
- **Script Requirements (`init_database.sql`)**:
  - Include `DROP TABLE IF EXISTS` and `CREATE TABLE` for: `sys_user`, `sys_role`, `sys_menu`, `sys_user_role`, `sys_role_menu`, `book_info`.
  - **Pre-seed Data**: Insert an Admin account (`admin`/`123456`) and a Normal User (`user`/`123456`) with BCrypt hashed passwords. Insert corresponding Role and Menu data to demonstrate RBAC. Insert 5-10 sample books.
- **Connection Info**: Use default local connection settings (Host: localhost, Port: 3306). If a password is required, assume standard local dev environment or prompt once if blocked.password is 123456

## Backend Conventions (后端规范)
- **Package Structure**: `controller`, `service`, `mapper`, `entity`, `dto`, `config`, `utils`.
- **Response Format**: Unified API response wrapper `Result<T>` (code, message, data, timestamp).
- **Security**: 
  - Use Spring Security + JWT filter chain.
  - Passwords must be encrypted using BCrypt.
  - Implement dynamic menu loading API (`GET /api/system/menu`) based on the logged-in user's role.
- **Redis Usage**: Cache user permissions and menus to improve performance; clear cache upon permission updates.

## Frontend Conventions (前端规范)
- **Syntax**: Strictly use JSX and React Hooks (`useState`, `useEffect`, `useContext`, etc.). No Class components.
- **State Management**: Use React Context API or lightweight state management for user auth state.
- **Dynamic Routing**: 
  - Fetch menu structure from backend after login.
  - Use `router.addRoute()` or equivalent logic to dynamically generate sidebar and routes.
- **Axios**: Encapsulate Axios with request/response interceptors (inject JWT token, handle global errors).

## Development Steps (推荐执行步骤)
1. **Infrastructure**: Setup Spring Boot project structure and configure MySQL/Redis connection properties (application.yml).
2. **Code Generation**: Generate all Backend and Frontend code.
3. **SQL Script Creation**: Create the `init_database.sql` file in the root directory with schema and test data.
4. **Auto Execute SQL**: Use the built-in terminal tool to run the SQL script against the local MySQL database (e.g., `mysql -u root -p<password> < init_database.sql` or similar appropriate command). Confirm success before finishing.

## Karpathy Guidelines (编码行为准则)

Derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls. Bias toward caution over speed; for trivial tasks, use judgment.

### 1. Think Before Coding (先思考再编码)
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First (简单优先)
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes (精准修改)
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.
- Test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution (目标驱动)
- Transform tasks into verifiable goals.
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"
- For multi-step tasks, state a brief plan with verification steps.