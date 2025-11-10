#!/bin/bash

################################################################################
# n8n SaaS Portfolio - Repository Structure Setup Script
#
# This script creates a complete, professional directory structure for the
# n8n SaaS Portfolio with 21+ Micro-SaaS projects organized in 4 clusters.
#
# Usage: bash setup_repo.sh
################################################################################

set -e

echo "=========================================="
echo "n8n SaaS Portfolio Structure Setup"
echo "=========================================="
echo ""

# Main directory
MAIN_DIR="n8n-saas-portfolio"
if [ -d "$MAIN_DIR" ]; then
    echo "⚠️  Directory '$MAIN_DIR' already exists. Skipping creation."
else
    mkdir -p "$MAIN_DIR"
    echo "✓ Created main directory: $MAIN_DIR"
fi

cd "$MAIN_DIR"

# Helper function to create project structure
create_project() {
    local cluster_path="$1"
    local project_name="$2"
    local project_desc="$3"

    mkdir -p "$cluster_path/$project_name"

    # Create basic project structure
    mkdir -p "$cluster_path/$project_name/src"
    mkdir -p "$cluster_path/$project_name/docs"
    mkdir -p "$cluster_path/$project_name/tests"
    mkdir -p "$cluster_path/$project_name/.github/workflows"

    # Create .gitkeep files to ensure directories are tracked
    touch "$cluster_path/$project_name/src/.gitkeep"
    touch "$cluster_path/$project_name/docs/.gitkeep"
    touch "$cluster_path/$project_name/tests/.gitkeep"
    touch "$cluster_path/$project_name/.github/workflows/.gitkeep"

    # Create project README
    cat > "$cluster_path/$project_name/README.md" << EOF
# $project_name

## Overview
$project_desc

## Directory Structure
\`\`\`
$project_name/
├── src/                    # Source code
├── docs/                   # Project documentation
├── tests/                  # Test files
├── .github/
│   └── workflows/         # GitHub Actions workflows
├── package.json           # NPM dependencies (when applicable)
├── README.md             # This file
└── LICENSE               # Project license
\`\`\`

## Development Setup
Coming soon...

## Configuration
Coming soon...

## Deployment
Coming soon...

## Testing
Coming soon...

## Contributing
See the main portfolio README.md for contribution guidelines.

## License
MIT License - See LICENSE file for details
EOF

    echo "✓ Created project: $cluster_path/$project_name"
}

################################################################################
# CLUSTER A: B2B-Connectors
################################################################################
echo ""
echo "Creating Cluster A: B2B-Connectors..."
CLUSTER_A="Cluster-A_B2B-Connectors"
mkdir -p "$CLUSTER_A"

create_project "$CLUSTER_A" "01_Procountor_2FA_Helper" \
    "Two-factor authentication helper for Procountor accounting software"

create_project "$CLUSTER_A" "02_Netvisor_Rackbeat_Sync" \
    "Synchronization bridge between Netvisor and Rackbeat logistics systems"

create_project "$CLUSTER_A" "03_MyCashflow_Reporter_AI" \
    "AI-powered financial reporting for MyCashflow e-commerce platform"

create_project "$CLUSTER_A" "04_Vilkas_Procountor_Bridge" \
    "Integration bridge connecting Vilkas warehouse with Procountor accounting"

create_project "$CLUSTER_A" "05_Finnish_Receipt_Scanner_AI" \
    "AI-based receipt scanning and processing for Finnish businesses"

################################################################################
# CLUSTER B: Productivity & HR
################################################################################
echo ""
echo "Creating Cluster B: Productivity & HR..."
CLUSTER_B="Cluster-B_Productivity-HR"
mkdir -p "$CLUSTER_B"

create_project "$CLUSTER_B" "06_Proactive_Health_Assistant" \
    "Proactive health monitoring and assistance system"

create_project "$CLUSTER_B" "07_Health_Dashboard_SME" \
    "Small and medium enterprise health metrics dashboard"

create_project "$CLUSTER_B" "08_B2B_Lead_Enricher_AI" \
    "AI-powered B2B lead enrichment and qualification service"

create_project "$CLUSTER_B" "09_Internal_Knowledge_Agent_RAG" \
    "Retrieval-Augmented Generation agent for internal knowledge bases"

create_project "$CLUSTER_B" "10_Recruitment_Assistant_SME" \
    "AI recruitment assistant tailored for small and medium enterprises"

################################################################################
# CLUSTER C: Customer Service & Conversion
################################################################################
echo ""
echo "Creating Cluster C: Customer Service & Conversion..."
CLUSTER_C="Cluster-C_Customer-Service-Conversion"
mkdir -p "$CLUSTER_C"

create_project "$CLUSTER_C" "11_Ecom_Sales_Agent_24-7" \
    "24/7 AI sales agent for e-commerce platforms"

create_project "$CLUSTER_C" "12_Smart_Cart_Recovery_AI" \
    "AI-driven shopping cart abandonment recovery system"

create_project "$CLUSTER_C" "13_Feedback_Analyzer_AI" \
    "Sentiment and feedback analysis using AI"

create_project "$CLUSTER_C" "14_Proactive_Support_Agent" \
    "Proactive customer support agent with issue prediction"

create_project "$CLUSTER_C" "15_Churn_Feedback_Collector" \
    "Automated churn analysis and feedback collection system"

################################################################################
# CLUSTER D: Content & Marketing AI
################################################################################
echo ""
echo "Creating Cluster D: Content & Marketing AI..."
CLUSTER_D="Cluster-D_Content-Marketing-AI"
mkdir -p "$CLUSTER_D"

create_project "$CLUSTER_D" "16_Finnish_SEO_Content_Factory" \
    "AI content factory for Finnish SEO optimization"

create_project "$CLUSTER_D" "17_Brand_Voice_AI_Assistant" \
    "AI assistant maintaining consistent brand voice across channels"

create_project "$CLUSTER_D" "18_Multichannel_Content_Scaler" \
    "Scale content across multiple channels automatically"

create_project "$CLUSTER_D" "19_Data_Visualizer_AI" \
    "AI-powered data visualization and reporting tool"

create_project "$CLUSTER_D" "20_Competitor_Analysis_Agent" \
    "Competitive intelligence gathering and analysis agent"

create_project "$CLUSTER_D" "21_Translation_Localization_Agent" \
    "AI translation and localization for global markets"

################################################################################
# BONUS: Autonomous Agents
################################################################################
echo ""
echo "Creating Bonus: Autonomous Agents..."
BONUS_DIR="Bonus_Autonomous_Agents"
mkdir -p "$BONUS_DIR"

create_project "$BONUS_DIR" "22_Autonomous_Recruitment_Agent" \
    "Fully autonomous recruitment and talent matching agent"

################################################################################
# Root-level files and directories
################################################################################
echo ""
echo "Creating root-level configuration files..."

# Create .github directory for repository-level workflows
mkdir -p ".github/workflows"
mkdir -p ".github/ISSUE_TEMPLATE"
mkdir -p ".github/PULL_REQUEST_TEMPLATE"

# Create pull request template
cat > ".github/PULL_REQUEST_TEMPLATE.md" << 'EOF'
## Description
Brief description of the changes and their purpose.

## Type of Change
- [ ] New feature (non-breaking)
- [ ] Bug fix (non-breaking)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Dependency update

## Related Projects
- Cluster: `[Cluster-A|Cluster-B|Cluster-C|Cluster-D|Bonus]`
- Project: `[Project name]`

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings generated
EOF

# Create issue template
cat > ".github/ISSUE_TEMPLATE/bug_report.md" << 'EOF'
---
name: Bug Report
about: Create a bug report to help us improve
---

## Description
Clear description of the bug.

## Affected Project
- Cluster: `[Cluster-A|Cluster-B|Cluster-C|Cluster-D|Bonus]`
- Project: `[Project name]`

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Environment
- OS: `[e.g., macOS, Linux, Windows]`
- Node.js version: `[if applicable]`
- n8n version: `[if applicable]`
EOF

# Create .gitignore
cat > ".gitignore" << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Build outputs
dist/
build/
.next/
out/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage
coverage/
.nyc_output/

# OS
Thumbs.db
.DS_Store

# Temporary files
*.tmp
temp/
tmp/
EOF

# Create .editorconfig
cat > ".editorconfig" << 'EOF'
# EditorConfig helps maintain consistent coding styles for multiple developers
# working on the same project across various editors and IDEs

root = true

# Default settings for all files
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

# JavaScript/TypeScript
[*.{js,jsx,ts,tsx}]
indent_style = space
indent_size = 2

# JSON
[*.json]
indent_style = space
indent_size = 2

# YAML
[*.{yaml,yml}]
indent_style = space
indent_size = 2

# Markdown
[*.md]
trim_trailing_whitespace = false
EOF

# Create LICENSE
cat > "LICENSE" << 'EOF'
MIT License

Copyright (c) 2024 n8n SaaS Portfolio Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Create CONTRIBUTING.md
cat > "CONTRIBUTING.md" << 'EOF'
# Contributing to n8n SaaS Portfolio

Thank you for your interest in contributing! Please follow these guidelines.

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit with clear messages: `git commit -am 'Add feature'`
5. Push to your branch: `git push origin feature/your-feature`
6. Submit a pull request

## Code Guidelines

- Follow the coding style in existing files
- Write clear, descriptive commit messages
- Update documentation for new features
- Add tests for bug fixes and new features
- Use meaningful variable and function names

## Project Structure

Each project in the portfolio follows this structure:
```
project-name/
├── src/          # Source code
├── docs/         # Documentation
├── tests/        # Test files
└── README.md     # Project-specific README
```

## Pull Request Process

1. Update README.md if needed
2. Ensure all tests pass
3. Follow the PR template
4. Request review from maintainers
5. Address feedback before merging

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Questions?

Open an issue or contact the maintainers.
EOF

echo "✓ Created root-level configuration files"

################################################################################
# Git initialization (optional - uncomment if needed)
################################################################################
# echo ""
# echo "Initializing git repository..."
# if [ -d ".git" ]; then
#     echo "⚠️  Git repository already exists"
# else
#     git init
#     git add .
#     git commit -m "Initial portfolio structure setup"
#     echo "✓ Git repository initialized"
# fi

################################################################################
# Summary
################################################################################
echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "Created structure:"
echo "  - 4 Clusters (A, B, C, D)"
echo "  - 21 Projects"
echo "  - 1 Bonus (Autonomous Agents)"
echo "  - Total: 22 Projects"
echo ""
echo "Next steps:"
echo "1. Review the main README.md in the portfolio root"
echo "2. Customize individual project READMEs"
echo "3. Initialize git: git init && git add . && git commit -m 'Initial setup'"
echo "4. Push to GitHub: git remote add origin <your-repo-url> && git push"
echo ""
echo "Happy building! 🚀"
