const { Client } = require('pg');

const connectionString = 'postgresql://mssp_user:12345678@localhost:5432/mssp_database';

async function setupPagePermissions() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Define all pages with their permissions
    const pages = [
      // Dashboard - all roles
      { 
        pageName: 'dashboard', 
        pageUrl: '/dashboard', 
        displayName: 'Dashboard', 
        description: 'Main dashboard view',
        category: 'main',
        icon: 'LayoutDashboard',
        adminAccess: true,
        managerAccess: true,
        engineerAccess: true,
        userAccess: true,
        sortOrder: 1
      },
      // Client Management - admin, manager, engineer
      { 
        pageName: 'clients', 
        pageUrl: '/clients', 
        displayName: 'Clients', 
        description: 'Client management',
        category: 'management',
        icon: 'Users',
        adminAccess: true,
        managerAccess: true,
        engineerAccess: true,
        userAccess: false,
        sortOrder: 2
      },
      // Contracts - admin, manager
      { 
        pageName: 'contracts', 
        pageUrl: '/contracts', 
        displayName: 'Contracts', 
        description: 'Contract management',
        category: 'management',
        icon: 'FileText',
        adminAccess: true,
        managerAccess: true,
        engineerAccess: false,
        userAccess: false,
        sortOrder: 3
      },
      // Services - admin, manager
      { 
        pageName: 'services', 
        pageUrl: '/services', 
        displayName: 'Services', 
        description: 'Service catalog management',
        category: 'management',
        icon: 'Package',
        adminAccess: true,
        managerAccess: true,
        engineerAccess: false,
        userAccess: false,
        sortOrder: 4
      },
      // License Management - admin, manager, engineer
      { 
        pageName: 'licenses', 
        pageUrl: '/licenses', 
        displayName: 'Licenses', 
        description: 'License pool management',
        category: 'management',
        icon: 'Key',
        adminAccess: true,
        managerAccess: true,
        engineerAccess: true,
        userAccess: false,
        sortOrder: 5
      },
      // Hardware Assets - admin, manager, engineer
      { 
        pageName: 'hardware', 
        pageUrl: '/hardware', 
        displayName: 'Hardware', 
        description: 'Hardware asset management',
        category: 'management',
        icon: 'HardDrive',
        adminAccess: true,
        managerAccess: true,
        engineerAccess: true,
        userAccess: false,
        sortOrder: 6
      },
      // Reports - all roles
      { 
        pageName: 'reports', 
        pageUrl: '/reports', 
        displayName: 'Reports', 
        description: 'System reports',
        category: 'analytics',
        icon: 'BarChart',
        adminAccess: true,
        managerAccess: true,
        engineerAccess: true,
        userAccess: true,
        sortOrder: 7
      },
      // Admin Section - admin only
      { 
        pageName: 'admin', 
        pageUrl: '/admin', 
        displayName: 'Admin', 
        description: 'System administration',
        category: 'system',
        icon: 'Settings',
        adminAccess: true,
        managerAccess: false,
        engineerAccess: false,
        userAccess: false,
        sortOrder: 8
      },
      // External Systems - admin only
      { 
        pageName: 'external-systems', 
        pageUrl: '/external-systems', 
        displayName: 'External Systems', 
        description: 'External system integrations',
        category: 'system',
        icon: 'Link',
        adminAccess: true,
        managerAccess: false,
        engineerAccess: false,
        userAccess: false,
        sortOrder: 9
      },

      // Audit Logs - admin only
      { 
        pageName: 'audit-logs', 
        pageUrl: '/audit-logs', 
        displayName: 'Audit Logs', 
        description: 'System audit logs',
        category: 'system',
        icon: 'Shield',
        adminAccess: true,
        managerAccess: false,
        engineerAccess: false,
        userAccess: false,
        sortOrder: 10
      }
    ];

    // Clear existing permissions
    await client.query('DELETE FROM page_permissions');
    console.log('🧹 Cleared existing permissions');

    // Insert new permissions
    for (const page of pages) {
      await client.query(`
        INSERT INTO page_permissions (
          page_name, page_url, display_name, description, category, icon,
          admin_access, manager_access, engineer_access, user_access,
          requires_special_permission, is_active, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        page.pageName,
        page.pageUrl,
        page.displayName,
        page.description,
        page.category,
        page.icon,
        page.adminAccess,
        page.managerAccess,
        page.engineerAccess,
        page.userAccess,
        false, // requires_special_permission
        true,  // is_active
        page.sortOrder
      ]);
    }

    console.log(`✅ Created ${pages.length} page permissions`);

    // Also ensure user settings exist for the admin
    // First check if user settings already exist
    const settingsResult = await client.query('SELECT id FROM user_settings WHERE user_id = $1', [1]);
    
    if (settingsResult.rows.length === 0) {
      await client.query(`
        INSERT INTO user_settings (user_id, email_notifications, push_notifications, contract_reminders, 
          financial_alerts, two_factor_auth, session_timeout, dark_mode, timezone, language, currency,
          auto_save_forms, data_export, api_access, data_retention_period)
        VALUES ($1, true, false, true, true, false, true, false, 'America/New_York', 'en', 'USD', 
          true, true, false, '5years')
      `, [1]);
    }
    console.log('✅ Ensured user settings exist for admin');

    console.log('\n🎉 Page permissions setup complete!');
    console.log('The admin user now has access to all pages.');

  } catch (error) {
    console.error('❌ Error setting up page permissions:', error);
  } finally {
    await client.end();
  }
}

setupPagePermissions(); 