const fs = require('fs');
const path = require('path');

// Read the routes file
const routesPath = path.join(__dirname, 'server', 'routes.ts');
const routesContent = fs.readFileSync(routesPath, 'utf8');

// Find the position to insert 2FA endpoints (after user authentication section)
const insertPosition = routesContent.indexOf('// ========================================\n  // CLIENT ENDPOINTS');

if (insertPosition === -1) {
  console.error('Could not find insertion point in routes.ts');
  process.exit(1);
}

// 2FA endpoints to add
const twoFAEndpoints = `
  // ========================================
  // TWO-FACTOR AUTHENTICATION ENDPOINTS
  // ========================================

  // Get 2FA status for current user
  app.get("/api/user/2fa/status", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await storage.getUserById(userId);
      
      res.json({
        enabled: !!user?.twoFactorSecret,
        backupCodesRemaining: user?.twoFactorBackupCodes ? 
          JSON.parse(user.twoFactorBackupCodes).filter((code: any) => !code.used).length : 0
      });
    } catch (error) {
      console.error("Get 2FA status error:", error);
      res.status(500).json({ message: "Failed to get 2FA status" });
    }
  });

  // Setup 2FA
  app.post("/api/user/2fa/setup", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate secret and QR code
      const { secret, qrCode } = await twoFAService.generateSecret(user.email);
      
      // Store the secret temporarily (not enabled yet)
      req.session.tempTwoFactorSecret = secret;

      res.json({
        secret,
        qrCode
      });
    } catch (error) {
      console.error("Setup 2FA error:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });

  // Enable 2FA
  app.post("/api/user/2fa/enable", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      const { token } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!req.session.tempTwoFactorSecret) {
        return res.status(400).json({ message: "No 2FA setup in progress" });
      }

      // Verify the token
      const isValid = twoFAService.verifyToken(req.session.tempTwoFactorSecret, token);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Generate backup codes
      const backupCodes = twoFAService.generateBackupCodes();

      // Update user with 2FA enabled
      await storage.updateUser(userId, {
        twoFactorSecret: req.session.tempTwoFactorSecret,
        twoFactorBackupCodes: JSON.stringify(backupCodes.map(code => ({ code, used: false })))
      });

      // Clear temp secret
      delete req.session.tempTwoFactorSecret;

      res.json({
        success: true,
        backupCodes
      });
    } catch (error) {
      console.error("Enable 2FA error:", error);
      res.status(500).json({ message: "Failed to enable 2FA" });
    }
  });

  // Disable 2FA
  app.post("/api/user/2fa/disable", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      const { password } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // Disable 2FA
      await storage.updateUser(userId, {
        twoFactorSecret: null,
        twoFactorBackupCodes: null
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Disable 2FA error:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });

  // Verify 2FA token
  app.post("/api/user/2fa/verify", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      const { token } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await storage.getUserById(userId);
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA not enabled" });
      }

      const isValid = twoFAService.verifyToken(user.twoFactorSecret, token);
      
      res.json({ valid: isValid });
    } catch (error) {
      console.error("Verify 2FA error:", error);
      res.status(500).json({ message: "Failed to verify 2FA token" });
    }
  });

`;

// Insert the 2FA endpoints
const updatedContent = 
  routesContent.slice(0, insertPosition) + 
  twoFAEndpoints +
  '\n  ' +
  routesContent.slice(insertPosition);

// Write the updated content
fs.writeFileSync(routesPath, updatedContent);

console.log('✅ Successfully added 2FA endpoints to routes.ts'); 