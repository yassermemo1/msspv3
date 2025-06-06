#!/usr/bin/env node

const { Client } = require('pg');

// Load environment variables
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function setupPagePermissions() {
  try {
    await client.connect();
    console.log('🔐 Setting up page permissions...\n');

    // First, create the table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS page_permissions (
        id SERIAL PRIMARY KEY,
        page_name TEXT NOT NULL UNIQUE,
        page_url TEXT NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'main',
        icon TEXT,
        admin_access BOOLEAN NOT NULL DEFAULT true,
        manager_access BOOLEAN NOT NULL DEFAULT false,
        engineer_access BOOLEAN NOT NULL DEFAULT false,
        user_access BOOLEAN NOT NULL DEFAULT false,
        requires_special_permission BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ Page permissions table created/verified');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_page_permissions_active ON page_permissions(is_active);
      CREATE INDEX IF NOT EXISTS idx_page_permissions_category ON page_permissions(category);
      CREATE INDEX IF NOT EXISTS idx_page_permissions_url ON page_permissions(page_url);
    `);

    console.log('✅ Database indexes created');

    // Insert/update initial page permissions
    const permissions = [
      {
        page_name: 'Dashboard',
        page_url: '/',
        display_name: 'Dashboard',
        description: 'Overview and key metrics',
        category: 'main',
        icon: 'LayoutDashboard',
        admin_access: true,
        manager_access: true,
        engineer_access: true,
        user_access: true,
        sort_order: 1
      },
      {
        page_name: 'Clients',
        page_url: '/clients',
        display_name: 'Clients',
        description: 'Manage client information and contacts',
        category: 'main',
        icon: 'Building',
        admin_access: true,
        manager_access: true,
        engineer_access: true,
        user_access: true,
        sort_order: 2
      },
      {
        page_name: 'Contracts',
        page_url: '/contracts',
        display_name: 'Contracts',
        description: 'Contract management and tracking',
        category: 'main',
        icon: 'FileText',
        admin_access: true,
        manager_access: true,
        engineer_access: false,
        user_access: false,
        sort_order: 3
      },
      {
        page_name: 'Services',
        page_url: '/services',
        display_name: 'Services',
        description: 'Service catalog and offerings',
        category: 'main',
        icon: 'ServerCog',
        admin_access: true,
        manager_access: false,
        engineer_access: true,
        user_access: false,
        sort_order: 4
      },
      {
        page_name: 'Assets',
        page_url: '/assets',
        display_name: 'Assets',
        description: 'Hardware and license management',
        category: 'main',
        icon: 'Server',
        admin_access: true,
        manager_access: true,
        engineer_access: true,
        user_access: true,
        sort_order: 5
      },
      {
        page_name: 'Financial',
        page_url: '/financial',
        display_name: 'Financial',
        description: 'Financial transactions and reporting',
        category: 'main',
        icon: 'DollarSign',
        admin_access: true,
        manager_access: true,
        engineer_access: false,
        user_access: false,
        sort_order: 6
      },
      {
        page_name: 'Team',
        page_url: '/team',
        display_name: 'Team',
        description: 'Team member and role management',
        category: 'main',
        icon: 'Users',
        admin_access: true,
        manager_access: true,
        engineer_access: false,
        user_access: false,
        sort_order: 7
      },
      {
        page_name: 'Proposals',
        page_url: '/proposals',
        display_name: 'Proposals',
        description: 'Technical and financial proposals',
        category: 'advanced',
        icon: 'BookOpen',
        admin_access: true,
        manager_access: true,
        engineer_access: true,
        user_access: false,
        sort_order: 10
      },
      {
        page_name: 'Service Scopes',
        page_url: '/service-scopes',
        display_name: 'Service Scopes',
        description: 'Service scope definitions and SAFs',
        category: 'advanced',
        icon: 'Target',
        admin_access: true,
        manager_access: false,
        engineer_access: true,
        user_access: false,
        sort_order: 11
      },
      {
        page_name: 'Documents',
        page_url: '/documents',
        display_name: 'Documents',
        description: 'Document management system',
        category: 'advanced',
        icon: 'FolderOpen',
        admin_access: true,
        manager_access: true,
        engineer_access: true,
        user_access: true,
        sort_order: 12
      },
      {
        page_name: 'Integration Engine',
        page_url: '/integration-engine',
        display_name: 'Integration Engine',
        description: 'External API integrations and data sync',
        category: 'integration',
        icon: 'Zap',
        admin_access: true,
        manager_access: false,
        engineer_access: true,
        user_access: false,
        sort_order: 20
      },
      {
        page_name: 'External Systems',
        page_url: '/external-systems',
        display_name: 'External Systems',
        description: 'External system configurations',
        category: 'integration',
        icon: 'Zap',
        admin_access: true,
        manager_access: false,
        engineer_access: true,
        user_access: false,
        sort_order: 21
      },
      {
        page_name: 'Bulk Import',
        page_url: '/bulk-import',
        display_name: 'Bulk Import',
        description: 'Import client data from CSV files',
        category: 'integration',
        icon: 'Upload',
        admin_access: true,
        manager_access: true,
        engineer_access: false,
        user_access: false,
        sort_order: 22
      },
      {
        page_name: 'Comprehensive Bulk Import',
        page_url: '/comprehensive-bulk-import',
        display_name: 'Comprehensive Bulk Import',
        description: 'Import comprehensive client data with multiple entities',
        category: 'integration',
        icon: 'Upload',
        admin_access: true,
        manager_access: true,
        engineer_access: false,
        user_access: false,
        sort_order: 23
      },
      {
        page_name: 'Reports',
        page_url: '/reports',
        display_name: 'Reports',
        description: 'Analytics and reporting',
        category: 'reports',
        icon: 'BarChart3',
        admin_access: true,
        manager_access: true,
        engineer_access: true,
        user_access: false,
        sort_order: 30
      },
      {
        page_name: 'Dynamic Dashboards',
        page_url: '/dashboards',
        display_name: 'Dynamic Dashboards',
        description: 'Customizable dashboard management',
        category: 'reports',
        icon: 'BarChart3',
        admin_access: true,
        manager_access: true,
        engineer_access: false,
        user_access: false,
        sort_order: 31
      },
      {
        page_name: 'Settings',
        page_url: '/settings',
        display_name: 'Settings',
        description: 'Application and user settings',
        category: 'admin',
        icon: 'Settings',
        admin_access: true,
        manager_access: false,
        engineer_access: false,
        user_access: false,
        sort_order: 40
      },
      {
        page_name: 'User Management',
        page_url: '/admin/users',
        display_name: 'User Management',
        description: 'Manage users and roles',
        category: 'admin',
        icon: 'Users',
        admin_access: true,
        manager_access: false,
        engineer_access: false,
        user_access: false,
        sort_order: 41
      },
      {
        page_name: 'RBAC Management',
        page_url: '/admin/rbac',
        display_name: 'RBAC Management',
        description: 'Configure role-based access control',
        category: 'admin',
        icon: 'Shield',
        admin_access: true,
        manager_access: false,
        engineer_access: false,
        user_access: false,
        sort_order: 42
      },
      {
        page_name: 'Audit Logs',
        page_url: '/admin/audit',
        display_name: 'Audit Logs',
        description: 'View system audit logs',
        category: 'admin',
        icon: 'FileText',
        admin_access: true,
        manager_access: false,
        engineer_access: false,
        user_access: false,
        sort_order: 43
      }
    ];

    console.log('📝 Inserting page permissions...');
    
    for (const perm of permissions) {
      await client.query(`
        INSERT INTO page_permissions (
          page_name, page_url, display_name, description, category, icon,
          admin_access, manager_access, engineer_access, user_access, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (page_name) DO UPDATE SET
          page_url = EXCLUDED.page_url,
          display_name = EXCLUDED.display_name,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          icon = EXCLUDED.icon,
          admin_access = EXCLUDED.admin_access,
          manager_access = EXCLUDED.manager_access,
          engineer_access = EXCLUDED.engineer_access,
          user_access = EXCLUDED.user_access,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()
      `, [
        perm.page_name, perm.page_url, perm.display_name, perm.description,
        perm.category, perm.icon, perm.admin_access, perm.manager_access,
        perm.engineer_access, perm.user_access, perm.sort_order
      ]);
      
      console.log(`   ✅ ${perm.display_name} (${perm.page_url})`);
    }

    // Verify the setup
    const result = await client.query(`
      SELECT 
        display_name,
        page_url,
        admin_access,
        manager_access,
        engineer_access,
        user_access,
        is_active
      FROM page_permissions 
      ORDER BY category, sort_order
    `);

    console.log('\n📊 Page Permissions Summary:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Page                    | URL               | Admin | Mgr | Eng | User | Active');
    console.log('───────────────────────────────────────────────────────────────');
    
    result.rows.forEach(row => {
      const page = row.display_name.padEnd(23);
      const url = row.page_url.padEnd(17);
      const admin = row.admin_access ? '✅   ' : '❌   ';
      const manager = row.manager_access ? '✅  ' : '❌  ';
      const engineer = row.engineer_access ? '✅  ' : '❌  ';
      const user = row.user_access ? '✅   ' : '❌   ';
      const active = row.is_active ? '✅' : '❌';
      
      console.log(`${page} | ${url} | ${admin} | ${manager} | ${engineer} | ${user} | ${active}`);
    });

    console.log('\n🎉 Page permissions setup complete!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Admin users can now access all pages');
    console.log('✅ Dashboard (/) is accessible to all roles');
    console.log('✅ Role-based access control is active');

  } catch (error) {
    console.error('❌ Error setting up page permissions:', error.message);
  } finally {
    await client.end();
  }
}

setupPagePermissions(); 