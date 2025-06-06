# Development Guidelines - MSSP Client Management Platform

## 🎯 Core Principles

### 1. Search Before Editing - Always Grep for Component Usage

**RULE**: Never edit or delete a component without first checking its usage across the codebase.

**Tools**:
```bash
# Use our custom script
./scripts/find-component-usage.sh ComponentName

# Or manual grep
grep -r "ComponentName" client/src/ --include="*.tsx" --include="*.ts"
```

**Example Workflow**:
```bash
# Before editing Sidebar component
./scripts/find-component-usage.sh Sidebar

# Check results:
# - Import statements
# - JSX usage
# - Export statements
# - Function references
```

### 2. Clean Up Dead Code - Remove Unused Components

**RULE**: Regularly audit and remove unused components to prevent confusion.

**Tools**:
```bash
# Find potentially unused components
./scripts/find-unused-components.sh
```

**Process**:
1. Run the unused components script monthly
2. Manually verify "UNUSED" components before deletion
3. Investigate "LOW USAGE" components for potential consolidation
4. Document any components kept for future use

### 3. Document Component Responsibilities

**RULE**: Every component should have clear documentation about its purpose and status.

**Required Documentation**:
```typescript
/**
 * ComponentName
 * 
 * RESPONSIBILITY: What this component does
 * STATUS: ACTIVE | DEPRECATED | EXPERIMENTAL
 * 
 * CONTAINS:
 * - List of main features
 * - Key functionality
 * 
 * USAGE: How to use this component
 * 
 * NOTES: Any special considerations
 */
```

**Example**:
```typescript
/**
 * AppLayout Component
 * 
 * RESPONSIBILITY: Main application layout wrapper with embedded navigation
 * STATUS: ACTIVE - This is the primary layout component used throughout the app
 * 
 * CONTAINS:
 * - Main navigation sidebar with collapsible functionality
 * - Header with page title and session status
 * - Main content area
 * 
 * USAGE: Wrap all authenticated pages with this component
 */
```

### 4. Extract Shared Configuration

**RULE**: Don't hardcode configuration in multiple places. Use shared config files.

**Shared Configurations**:
- Navigation: `client/src/config/navigation.ts`
- API endpoints: `client/src/config/api.ts` (future)
- Theme settings: `client/src/config/theme.ts` (future)
- Constants: `client/src/config/constants.ts` (future)

**Navigation Example**:
```typescript
// ❌ DON'T: Hardcode in component
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  // ...
];

// ✅ DO: Use shared config
import { mainNavigation } from "@/config/navigation";
```

### 5. Follow Consistent Architecture Patterns

**RULE**: Decide on one approach and stick to it throughout the project.

## 📁 File Organization

### Component Structure
```
client/src/components/
├── ui/           # Reusable UI components (buttons, inputs, etc.)
├── forms/        # Form components
├── layout/       # Layout components (headers, sidebars, etc.)
└── features/     # Feature-specific components
```

### Configuration Structure
```
client/src/config/
├── navigation.ts # Navigation configuration
├── api.ts       # API endpoints and configuration
├── theme.ts     # Theme and styling configuration
└── constants.ts # Application constants
```

## 🔍 Code Review Checklist

### Before Creating/Editing Components

- [ ] Search for existing similar components
- [ ] Check if the component is actually used
- [ ] Verify the component follows naming conventions
- [ ] Ensure proper TypeScript types are defined

### Component Requirements

- [ ] Has proper JSDoc documentation
- [ ] Uses shared configurations where applicable
- [ ] Follows consistent patterns with existing components
- [ ] Has proper error handling
- [ ] Uses proper TypeScript types

### Before Deleting Components

- [ ] Run `./scripts/find-component-usage.sh ComponentName`
- [ ] Verify no imports or references exist
- [ ] Check if component is exported from index files
- [ ] Confirm component is not used in tests

## 🛠️ Development Tools

### Custom Scripts

1. **Component Usage Finder**:
   ```bash
   ./scripts/find-component-usage.sh ComponentName
   ```

2. **Unused Component Detector**:
   ```bash
   ./scripts/find-unused-components.sh
   ```

### Recommended VS Code Extensions

- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

## 🚨 Common Pitfalls to Avoid

### 1. Multiple Navigation Implementations
**Problem**: Having navigation defined in multiple places
**Solution**: Use shared navigation config from `@/config/navigation`

### 2. Unused Component Accumulation
**Problem**: Components that are no longer used but not deleted
**Solution**: Regular audits using our unused component script

### 3. Inconsistent Component Patterns
**Problem**: Different components following different patterns
**Solution**: Follow established patterns and document deviations

### 4. Missing Documentation
**Problem**: Components without clear purpose or usage instructions
**Solution**: Mandatory JSDoc comments for all components

## 📋 Monthly Maintenance Tasks

### Component Audit (1st of each month)
1. Run `./scripts/find-unused-components.sh`
2. Review and clean up unused components
3. Update component documentation
4. Check for duplicate functionality

### Configuration Review (15th of each month)
1. Review shared configurations for completeness
2. Look for hardcoded values that should be in config
3. Update configuration documentation

## 🎯 Success Metrics

- **Zero duplicate navigation implementations**
- **All components have proper documentation**
- **Less than 5% unused components at any time**
- **Consistent patterns across all components**
- **No hardcoded configurations in components**

## 📚 Additional Resources

- [React TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)
- [Component Design Patterns](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)

---

**Remember**: These guidelines exist to prevent the confusion we experienced with multiple sidebar components. Following them will save time and reduce bugs in the future. 