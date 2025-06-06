# Column Visibility Feature for Client Management

## Overview
Enhanced the clients page at `/clients` to allow users to show/hide table columns and save their preferences.

## Features

### 1. **Column Visibility Controls**
- **Location**: In the toolbar next to the search bar
- **Button**: "Columns (X)" where X shows the number of visible columns
- **Dropdown**: Shows all available columns with checkboxes

### 2. **Available Columns**
- ✅ **Select** (checkbox) - Mandatory, cannot be hidden
- ✅ **Name** - Mandatory, cannot be hidden  
- ✅ **Short Name** - Mandatory, cannot be hidden, clickable (links to client details)
- ✅ **Domain** - Mandatory, cannot be hidden, clickable (links to client details)
- ✅ **Industry** - Optional, visible by default
- ⭕ **Company Size** - Optional, hidden by default
- ✅ **Status** - Optional, visible by default
- ✅ **Source** - Optional, visible by default
- ⭕ **Address** - Optional, hidden by default
- ⭕ **Website** - Optional, hidden by default
- ✅ **Created** - Optional, visible by default
- ✅ **Updated** - Mandatory, cannot be hidden, clickable (links to client details)
- ✅ **Actions** - Mandatory, cannot be hidden

### 3. **Enhanced Column Display**
- **Icons**: Each column has relevant icons (Globe for website, Map pin for address, etc.)
- **Truncation**: Long text fields are truncated with tooltips
- **Links**: Website column renders as clickable links
- **Formatting**: Dates are properly formatted with calendar icons

### 4. **Persistence**
- **Local Storage**: Column preferences are automatically saved to browser localStorage
- **Key**: `clients-table-columns`
- **Scope**: Per-user, per-browser
- **Restoration**: Preferences are restored when the page is refreshed

### 5. **Both Tables**
- **Active Clients**: Full column visibility with checkboxes for bulk operations
- **Archived Clients**: Same column visibility (except checkbox column)
- **Shared Preferences**: Both tables use the same column settings

### 6. **Reset Functionality**
- **Reset Button**: "Reset to Default" button in the column dropdown
- **Action**: Restores default column visibility settings
- **Default State**: Shows Name, Industry, Status, Source, Created, and Actions

## Implementation Details

### Components Created
1. **`ColumnVisibility`** (`/components/ui/column-visibility.tsx`)
   - Reusable dropdown component for column visibility controls
   - Supports mandatory columns that cannot be hidden
   - Shows visible column count in the trigger button

2. **`useColumnPreferences`** (`/hooks/use-column-preferences.ts`)
   - Custom hook for managing column preferences with localStorage
   - Handles initialization, persistence, and state management
   - Graceful error handling for localStorage failures

### Column Definitions
```typescript
const clientColumns: ColumnDefinition[] = [
  { key: "checkbox", label: "Select", defaultVisible: true, mandatory: true },
  { key: "name", label: "Name", defaultVisible: true, mandatory: true },
  { key: "shortName", label: "Short Name", defaultVisible: true, mandatory: true },
  { key: "domain", label: "Domain", defaultVisible: true, mandatory: true },
  { key: "industry", label: "Industry", defaultVisible: true },
  { key: "companySize", label: "Company Size", defaultVisible: false },
  { key: "status", label: "Status", defaultVisible: true },
  { key: "source", label: "Source", defaultVisible: true },
  { key: "address", label: "Address", defaultVisible: false },
  { key: "website", label: "Website", defaultVisible: false },
  { key: "createdAt", label: "Created", defaultVisible: true },
  { key: "updatedAt", label: "Updated", defaultVisible: true, mandatory: true },
  { key: "actions", label: "Actions", defaultVisible: true, mandatory: true }
];
```

## Usage Instructions

1. **Access Column Controls**:
   - Navigate to `/clients`
   - Click the "Columns (X)" button in the toolbar

2. **Show/Hide Columns**:
   - Use checkboxes in the dropdown to toggle column visibility
   - Mandatory columns (Select, Name, Actions) cannot be hidden
   - Changes are applied immediately

3. **Reset to Defaults**:
   - Click "Reset to Default" in the dropdown
   - All columns return to their original default visibility

4. **Persistent Settings**:
   - Your preferences are automatically saved
   - Settings persist across browser sessions
   - Each user has independent preferences per browser

## Technical Notes

- **Performance**: Column visibility changes are instantaneous
- **Browser Support**: Uses localStorage (IE8+, all modern browsers)
- **Responsive**: Table adapts to column count dynamically
- **Accessibility**: Proper labels and ARIA attributes for screen readers
- **Error Handling**: Graceful fallback if localStorage is unavailable

## Future Enhancements

1. **Server-Side Persistence**: Store preferences in user settings table
2. **Column Reordering**: Allow drag-and-drop column reordering
3. **Column Sizing**: Adjustable column widths
4. **Export Preferences**: Include only visible columns in CSV export
5. **Preset Views**: Pre-defined column layouts (minimal, detailed, etc.) 