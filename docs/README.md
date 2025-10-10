## ⚙️ Tech Stack & Architecture

### **Frontend Stack**
- **React 19.1.1** - Latest stable version with improved performance and new features
- **TypeScript ~5.8.3** - Strong typing for better developer experience and code reliability
- **Vite 7.1.6** - Ultra-fast build tool and development server
- **Tailwind CSS 4.1.13** - Utility-first CSS framework with modern design system
- **ESLint 9.35.0** - Code linting for consistent code quality

**Why these choices?**
- React 19 brings automatic batching and improved concurrent features
- TypeScript ensures type safety and better IDE support
- Vite provides instant hot module replacement and optimized builds
- Tailwind enables rapid UI development with consistent design tokens

### **Backend Stack**
- **Go 1.22+** - Modern, performant language with excellent concurrency
- **Chi/Fiber** - Lightweight HTTP router/framework (TBD based on performance needs)
- **GORM** - Go ORM for database operations with MySQL support
- **UUID v4** - Secure primary keys for all database entities
- **bcrypt/argon2** - Password hashing algorithms for security

**Why these choices?**
- Go offers excellent performance, memory safety, and built-in concurrency
- GORM provides database abstraction while maintaining performance
- UUID primary keys prevent enumeration attacks and enable distributed systems
- Modern hashing algorithms protect against rainbow table attacks

### **Database & Storage**
- **MySQL 8.0+** - Reliable RDBMS with JSON support and strong ACID compliance
- **Database Design** - Normalized schema with proper relationships and constraints
- **Migrations** - Version-controlled schema changes for consistent deployments
- **Indexing Strategy** - Optimized for common query patterns

**Why MySQL?**
- Mature ecosystem with excellent tooling and community support
- Strong consistency guarantees for relationship data
- JSON column support for flexible data when needed
- Proven scalability for web applications

### **Infrastructure & DevOps**
- **Docker 24.0+** - Containerization for consistent environments
- **Docker Compose** - Multi-service orchestration for local development
- **Make** - Build automation and task management
- **Git Flow** - Structured branching strategy for team collaboration

### **Development Tools**
- **VS Code** - Primary IDE with extensions for Go, React, and Docker
- **Node.js 18+** - JavaScript runtime for frontend tooling
- **npm** - Package management for frontend dependencies
- **Go Modules** - Dependency management for backend services

### **Planned Additions**
- **WebSockets** - Real-time features (notifications, live updates) - *Post-MVP*
- **Redis** - Caching and session storage - *Performance optimization phase*
- **JWT** - Authentication tokens - *Security implementation*
- **GitHub Actions** - CI/CD pipeline - *Automation phase*

### **Hosting & Deployment** *(TBD)*
- **Frontend**: Vercel / Netlify (Static hosting with CDN)
- **Backend**: Railway / Render / AWS ECS (Container hosting)
- **Database**: PlanetScale / AWS RDS (Managed MySQL)
- **Monitoring**: Sentry / DataDog (Error tracking and performance)

> **Version Strategy**: We use specific versions to ensure reproducible builds across all environments. All versions are regularly updated following security best practices and stability requirements.  