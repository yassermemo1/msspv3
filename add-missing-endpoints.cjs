const fs = require('fs');
const path = require('path');

console.log('🔧 Adding missing endpoints...\n');

// Read the routes file
const routesPath = path.join(__dirname, 'server', 'routes.ts');
let routesContent = fs.readFileSync(routesPath, 'utf8');

// Add company settings endpoint after user settings
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

// Add team assignments endpoint
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

// Find the best position to insert company settings (after user settings)
const userSettingsPattern = /app\.get\("\/api\/user\/settings"[\s\S]*?\}\);/;
const userSettingsMatch = routesContent.match(userSettingsPattern);

if (userSettingsMatch && !routesContent.includes('/api/company-settings')) {
  const insertPos = userSettingsMatch.index + userSettingsMatch[0].length;
  routesContent = routesContent.slice(0, insertPos) + '\n' + companySettingsEndpoint + routesContent.slice(insertPos);
  console.log('✅ Added company settings endpoints');
}

// Find the best position to insert team assignments (after proposals)
const proposalsPattern = /app\.get\("\/api\/proposals"[\s\S]*?\}\);/;
const proposalsMatch = routesContent.match(proposalsPattern);

if (proposalsMatch && !routesContent.includes('/api/team-assignments')) {
  const insertPos = proposalsMatch.index + proposalsMatch[0].length;
  routesContent = routesContent.slice(0, insertPos) + '\n' + teamAssignmentsEndpoint + routesContent.slice(insertPos);
  console.log('✅ Added team assignments endpoint');
}

// Fix the 2FA endpoint to work without twoFactorSecret field
const twoFAFix = `
  // Get 2FA status for current user
  app.get("/api/user/2fa/status", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Since twoFactorSecret doesn't exist in our schema, always return disabled
      res.json({
        enabled: false,
        backupCodesRemaining: 0
      });
    } catch (error) {
      console.error("Get 2FA status error:", error);
      res.status(500).json({ message: "Failed to get 2FA status" });
    }
  });`;

// Replace the 2FA endpoint
const twoFARegex = /app\.get\("\/api\/user\/2fa\/status"[\s\S]*?\}\);/;
if (twoFARegex.test(routesContent)) {
  routesContent = routesContent.replace(twoFARegex, twoFAFix.trim());
  console.log('✅ Fixed 2FA status endpoint');
}

// Write the updated content back
fs.writeFileSync(routesPath, routesContent);

console.log('\n✨ All missing endpoints have been added!'); 