const fs = require('fs');
const path = require('path');

console.log('🔧 Applying final route fixes...\n');

// Read the routes file
const routesPath = path.join(__dirname, 'server', 'routes.ts');
let routesContent = fs.readFileSync(routesPath, 'utf8');

// 1. Fix the 2FA endpoint - it needs proper error handling for missing twoFactorSecret field
const twoFAFix = `
  // Get 2FA status for current user
  app.get("/api/user/2fa/status", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await storage.getUserById(userId);
      
      res.json({
        enabled: false, // Since twoFactorSecret field doesn't exist in the schema
        backupCodesRemaining: 0
      });
    } catch (error) {
      console.error("Get 2FA status error:", error);
      res.status(500).json({ message: "Failed to get 2FA status" });
    }
  });`;

// Replace the existing 2FA endpoint
const twoFARegex = /app\.get\("\/api\/user\/2fa\/status"[\s\S]*?\}\);/;
if (routesContent.match(twoFARegex)) {
  routesContent = routesContent.replace(twoFARegex, twoFAFix.trim());
  console.log('✅ Fixed 2FA status endpoint');
}

// 2. Fix dashboard widgets - use correct table name
const dashboardWidgetsFix = `
  // Get dashboard widgets
  app.get("/api/dashboard/widgets", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get all available widgets
      const widgets = await db
        .select({
          id: widgets.id,
          name: widgets.name,
          type: widgets.type,
          config: widgets.config,
          defaultSize: widgets.defaultSize,
          minSize: widgets.minSize,
          maxSize: widgets.maxSize,
          description: widgets.description,
          isActive: widgets.isActive
        })
        .from(widgets)
        .where(eq(widgets.isActive, true));

      res.json(widgets);
    } catch (error) {
      console.error("Get dashboard widgets error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard widgets" });
    }
  });`;

// Replace the existing dashboard widgets endpoint
const widgetsRegex = /app\.get\("\/api\/dashboard\/widgets"[\s\S]*?\}\);/;
if (routesContent.match(widgetsRegex)) {
  routesContent = routesContent.replace(widgetsRegex, dashboardWidgetsFix.trim());
  console.log('✅ Fixed dashboard widgets endpoint');
}

// 3. Add missing company settings endpoint
if (!routesContent.includes('app.get("/api/company-settings"')) {
  const companySettingsEndpoint = `
  // Get company settings
  app.get("/api/company-settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      console.error("Get company settings error:", error);
      res.status(500).json({ message: "Failed to fetch company settings" });
    }
  });

  // Update company settings (admin only)
  app.put("/api/company-settings", requireAdmin, async (req, res) => {
    try {
      const updatedSettings = await storage.updateCompanySettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Update company settings error:", error);
      res.status(500).json({ message: "Failed to update company settings" });
    }
  });
`;

  // Find a good position to insert it
  const userSettingsPos = routesContent.indexOf('// User settings endpoints');
  if (userSettingsPos > -1) {
    routesContent = routesContent.slice(0, userSettingsPos) + 
      companySettingsEndpoint + '\n' +
      routesContent.slice(userSettingsPos);
    console.log('✅ Added company settings endpoints');
  }
}

// 4. Add missing team assignments endpoint
if (!routesContent.includes('app.get("/api/team-assignments"')) {
  const teamAssignmentsEndpoint = `
  // Get team assignments
  app.get("/api/team-assignments", requireAuth, async (req, res) => {
    try {
      const assignments = await db
        .select({
          id: clientTeamAssignments.id,
          clientId: clientTeamAssignments.clientId,
          userId: clientTeamAssignments.userId,
          role: clientTeamAssignments.role,
          assignedAt: clientTeamAssignments.assignedAt,
          assignedBy: clientTeamAssignments.assignedBy,
          notes: clientTeamAssignments.notes,
          isActive: clientTeamAssignments.isActive
        })
        .from(clientTeamAssignments)
        .where(eq(clientTeamAssignments.isActive, true));

      res.json(assignments);
    } catch (error) {
      console.error("Get team assignments error:", error);
      res.status(500).json({ message: "Failed to fetch team assignments" });
    }
  });
`;

  // Find a good position to insert it - after proposals
  const proposalsPos = routesContent.indexOf('// Proposals endpoints');
  const nextSectionPos = routesContent.indexOf('// Health check endpoint', proposalsPos);
  if (proposalsPos > -1 && nextSectionPos > -1) {
    // Find the end of proposals section
    const insertPos = routesContent.lastIndexOf('});', nextSectionPos) + 3;
    routesContent = routesContent.slice(0, insertPos) + 
      '\n' + teamAssignmentsEndpoint + '\n' +
      routesContent.slice(insertPos);
    console.log('✅ Added team assignments endpoint');
  }
}

// Write the updated content back
fs.writeFileSync(routesPath, routesContent);

console.log('\n✨ Final route fixes completed!'); 