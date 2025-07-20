# 🧙‍♂️ PostgreSQL Wizard Studio

<div align="center">

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**A powerful, modern web-based PostgreSQL IDE with intelligent query execution and beautiful data visualization**

[🚀 Live Demo](#) • [📖 Documentation](#features) • [🛠️ Installation](#installation) • [🤝 Contributing](#contributing)

</div>

---

## ✨ Features

### 🎯 **Smart SQL Editor**
- **Syntax Highlighting** - Full PostgreSQL syntax support with intelligent highlighting
- **Auto-completion** - Smart suggestions for keywords, table names, and column names
- **Query Formatting** - One-click SQL query beautification
- **Multi-query Execution** - Execute multiple queries separated by semicolons
- **Keyboard Shortcuts** - F5 or Ctrl+Enter to execute queries

### 📊 **Advanced Query Results**
- **Tabular Data Display** - Beautiful, responsive tables with sorting and filtering
- **Multiple Result Sets** - Handle multiple query results in organized tabs
- **Export Capabilities** - Download results as CSV files
- **Execution Metrics** - View query execution time and row counts
- **Error Handling** - Detailed error messages with SQL state codes

### 💻 **Interactive Terminal**
- **PostgreSQL-style Terminal** - Authentic psql command experience
- **Meta-commands Support**:
  - `\l` - List all databases
  - `\dt` - List all tables
  - `\d <table>` - Describe table structure
- **Command History** - Navigate through previous commands with arrow keys
- **Real-time Execution** - Instant query execution with formatted output

### 🗄️ **Database Explorer**
- **Schema Browser** - Visual exploration of database structure
- **Table Information** - View table schemas, columns, and relationships
- **Auto-refresh** - Automatic schema updates after DDL operations
- **Search & Filter** - Quick search through database objects

### 📝 **Query History Management**
- **Persistent History** - Keep track of all executed queries
- **Query Replay** - Re-execute previous queries with one click
- **Export History** - Save query history for documentation
- **Execution Status** - Visual indicators for success/failure

---

## 🏗️ Architecture

### **Frontend Stack**
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with excellent IntelliSense
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **shadcn/ui** - High-quality, accessible React components
- **Radix UI** - Unstyled, accessible components for custom design systems

### **Backend Integration**
- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **PostgreSQL Functions** - Custom PL/pgSQL functions for query execution
- **Real-time Updates** - Live schema changes and query results
- **Security** - Row Level Security (RLS) and user authentication

### **Key Components**
```
src/
├── components/sql/
│   ├── SQLEditor.tsx      # Smart SQL editor with autocomplete
│   ├── QueryResults.tsx   # Tabular results display
│   ├── Terminal.tsx       # Interactive PostgreSQL terminal
│   ├── DatabaseExplorer.tsx # Schema browser
│   └── QueryHistory.tsx   # Query history management
├── pages/
│   └── PostgreSQLIDE.tsx  # Main IDE orchestrator
└── integrations/supabase/
    ├── client.ts          # Supabase client configuration
    └── types.ts           # TypeScript type definitions
```

---

## 🚀 Installation

### **Prerequisites**
- Node.js 18+ and npm/yarn/bun
- Supabase account (for database backend)

### **Local Development Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fredrickmureti/postgres-wizard-studio.git
   cd postgres-wizard-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up Supabase**
   ```bash
   # Install Supabase CLI
   npm install -g @supabase/cli
   
   # Initialize Supabase (if not already done)
   supabase init
   
   # Start local Supabase (optional for local development)
   supabase start
   
   # Apply database migrations
   supabase db reset
   ```

4. **Configure environment**
   ```bash
   # Update src/integrations/supabase/client.ts with your Supabase credentials
   # Or use environment variables (recommended for production)
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` to access the PostgreSQL Wizard Studio

---

## 🎮 Usage

### **Getting Started**
1. **Connect to Database** - The app connects to your Supabase PostgreSQL instance
2. **Write Queries** - Use the SQL editor to write and execute queries
3. **Explore Results** - View results in beautiful, interactive tables
4. **Use Terminal** - Access PostgreSQL meta-commands for database exploration
5. **Export Data** - Download query results as CSV files

### **Sample Queries to Try**
```sql
-- Create a sample table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert some data
INSERT INTO users (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Johnson', 'bob@example.com');

-- Query the data
SELECT * FROM users ORDER BY created_at DESC;

-- Try some analytics
SELECT 
    DATE(created_at) as signup_date,
    COUNT(*) as new_users
FROM users 
GROUP BY DATE(created_at)
ORDER BY signup_date;
```

### **Terminal Commands**
```bash
# List all databases
\l

# List all tables in current database
\dt

# Describe a specific table
\d users

# Clear terminal
clear

# Show help
help
```

---

## 🛠️ Development

### **Project Structure**
```
postgres-wizard-studio/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/            # Main application pages
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── integrations/     # External service integrations
├── supabase/
│   ├── migrations/       # Database schema migrations
│   └── config.toml       # Supabase configuration
├── public/               # Static assets
└── docs/                 # Documentation files
```

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### **Database Functions**
The app uses custom PostgreSQL functions for secure query execution:

- `execute_sql(query_text TEXT)` - Execute arbitrary SQL queries
- `get_table_info()` - Retrieve table schema information

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use the existing component patterns
- Ensure responsive design
- Write meaningful commit messages
- Test your changes thoroughly

### **Areas for Contribution**
- 🐛 Bug fixes and performance improvements
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage improvements

---

## 📊 Technologies Used

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI, Lucide Icons |
| **Backend** | Supabase, PostgreSQL, PL/pgSQL |
| **Build Tools** | Vite, ESLint, PostCSS |
| **Deployment** | Vercel, Netlify (compatible) |

---

## 📈 Roadmap

### **Current Version (v1.0)**
- ✅ Basic SQL editor with syntax highlighting
- ✅ Query execution and results display
- ✅ PostgreSQL terminal emulation
- ✅ Database schema exploration
- ✅ Query history management

### **Upcoming Features**
- 🔄 **Query Caching** - Cache frequent queries for better performance
- 📊 **Query Performance Analytics** - Detailed execution plans and optimization hints
- 🔐 **Multiple Database Connections** - Connect to multiple PostgreSQL instances
- 📱 **Mobile Responsive Design** - Full mobile and tablet support
- 🌙 **Dark/Light Theme** - Customizable UI themes
- 🔍 **Advanced Search** - Full-text search across database objects
- 📤 **Data Import/Export** - Support for various file formats
- 🤖 **AI-Powered Query Suggestions** - Intelligent query recommendations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Supabase** - For providing excellent PostgreSQL backend services
- **shadcn/ui** - For beautiful, accessible React components
- **Radix UI** - For primitive UI components
- **Lucide** - For the amazing icon library
- **Tailwind CSS** - For the utility-first CSS framework

---

<div align="center">

**Built with ❤️ by [Fredrick Mureti](https://github.com/Fredrickmureti)**

[⭐ Star this repo](https://github.com/Fredrickmureti/postgres-wizard-studio) • [🐛 Report Bug](https://github.com/Fredrickmureti/postgres-wizard-studio/issues) • [💡 Request Feature](https://github.com/Fredrickmureti/postgres-wizard-studio/issues)

</div>
