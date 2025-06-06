# LDAP Authentication Integration Guide

## Overview

This guide covers the implementation of LDAP authentication for the MSSP Client Management Platform. The LDAP integration allows users to authenticate against an LDAP directory server while maintaining local user records for role-based access control and application-specific attributes.

## Architecture

### Dual Authentication System

The platform now supports two authentication methods:

1. **Local Authentication**: Traditional username/password stored in the local PostgreSQL database
2. **LDAP Authentication**: Authentication against an external LDAP directory with local "shadow" user creation

### Key Components

- **LDAP Strategy** (`server/auth/ldap.strategy.ts`): Passport.js strategy for LDAP authentication
- **User Provisioning**: Automatic creation of local "shadow" users for LDAP-authenticated users
- **Session Management**: Consistent session handling for both local and LDAP users
- **Role Assignment**: Default role assignment for new LDAP users with future extensibility for group-based roles

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# LDAP Authentication Configuration
LDAP_ENABLED=true                                    # Enable/disable LDAP authentication
LDAP_URL=ldap://ldap.forumsys.com:389              # LDAP server URL
LDAP_BIND_DN=cn=read-only-admin,dc=example,dc=com   # Bind DN for LDAP searches
LDAP_BIND_PASSWORD=password                          # Bind password
LDAP_SEARCH_BASE=dc=example,dc=com                  # Search base for users
LDAP_SEARCH_FILTER=(uid={{username}})               # Search filter ({{username}} placeholder)

# LDAP User Attribute Mapping
LDAP_USERNAME_FIELD=uid                             # LDAP attribute for username
LDAP_EMAIL_FIELD=mail                               # LDAP attribute for email
LDAP_FIRSTNAME_FIELD=givenName                      # LDAP attribute for first name
LDAP_LASTNAME_FIELD=sn                              # LDAP attribute for last name

# LDAP Security Options
LDAP_TLS_ENABLED=false                              # Enable TLS/SSL
LDAP_TLS_REJECT_UNAUTHORIZED=true                   # Reject unauthorized certificates

# User Provisioning
LDAP_DEFAULT_ROLE=engineer                          # Default role for new LDAP users
```

### Test LDAP Server (Forumsys)

For testing purposes, you can use the public Forumsys LDAP server:

```bash
LDAP_URL=ldap://ldap.forumsys.com:389
LDAP_BIND_DN=cn=read-only-admin,dc=example,dc=com
LDAP_BIND_PASSWORD=password
LDAP_SEARCH_BASE=dc=example,dc=com
LDAP_SEARCH_FILTER=(uid={{username}})
```

**Test Users:**
- Username: `tesla`, Password: `password`
- Username: `einstein`, Password: `password`
- Username: `newton`, Password: `password`
- Username: `galieleo`, Password: `password`
- Username: `euler`, Password: `password`

## Database Schema Changes

### Users Table Modifications

The `users` table has been updated to support LDAP authentication:

```sql
-- New columns added
ALTER TABLE users ADD COLUMN auth_provider text DEFAULT 'local' NOT NULL;
ALTER TABLE users ADD COLUMN ldap_id text;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_ldap_id_unique UNIQUE(ldap_id);
```

### Field Descriptions

- `auth_provider`: Indicates authentication method ('local' or 'ldap')
- `ldap_id`: Unique identifier from LDAP (typically DN or uid)
- `password`: Made nullable for LDAP users (they don't have local passwords)

## API Endpoints

### LDAP Login

**Endpoint:** `POST /api/auth/ldap/login`

**Request Body:**
```json
{
  "username": "tesla",
  "password": "password"
}
```

**Success Response (200):**
```json
{
  "id": "uuid-here",
  "username": "tesla",
  "email": "tesla@ldap.forumsys.com",
  "firstName": "Nikola",
  "lastName": "Tesla",
  "role": "engineer",
  "authProvider": "ldap",
  "ldapId": "uid=tesla,dc=example,dc=com",
  "isActive": true,
  "createdAt": "2025-05-31T16:00:00.000Z"
}
```

**Error Responses:**

- `400`: LDAP authentication disabled
- `401`: Invalid credentials
- `500`: Server error or LDAP connection failure

### Local Login (Unchanged)

**Endpoint:** `POST /api/login`

Continues to work as before for local users.

## User Provisioning Flow

### First-Time LDAP Login

1. User submits credentials to `/api/auth/ldap/login`
2. LDAP strategy authenticates against LDAP server
3. System extracts user attributes from LDAP profile
4. System checks for existing user by LDAP ID
5. If not found, checks for existing user by email
6. If no conflicts, creates new local "shadow" user with:
   - `authProvider`: 'ldap'
   - `ldapId`: LDAP unique identifier
   - `password`: null
   - `role`: Default role from `LDAP_DEFAULT_ROLE`
7. User is logged in with session created

### Subsequent LDAP Logins

1. User submits credentials to `/api/auth/ldap/login`
2. LDAP strategy authenticates against LDAP server
3. System finds existing user by LDAP ID
4. User is logged in with existing local user record

### Conflict Handling

- **Email Conflict**: If a local user exists with the same email, authentication fails with an error
- **Account Linking**: Not currently supported (future enhancement)

## Security Considerations

### Password Handling

- LDAP users have `password: null` in the local database
- Local users continue to have hashed passwords
- No passwords are stored in plaintext

### Session Management

- LDAP and local users use the same session mechanism
- Sessions are stored in PostgreSQL with the same security model
- Session cookies have the same security attributes

### LDAP Connection Security

- Configure `LDAP_TLS_ENABLED=true` for production
- Use secure bind credentials
- Consider using a dedicated service account for LDAP binds

## Testing

### Automated Testing

Run the LDAP integration test suite:

```bash
node test-ldap-integration.js
```

This script tests:
- Server connectivity
- Valid LDAP authentication
- Invalid credential rejection
- User provisioning (shadow user creation)
- Session persistence

### Manual Testing

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test LDAP login:**
   ```bash
   curl -X POST http://localhost:5001/api/auth/ldap/login \
     -H "Content-Type: application/json" \
     -d '{"username": "tesla", "password": "password"}'
   ```

3. **Verify user creation in database:**
   ```sql
   SELECT id, username, email, auth_provider, ldap_id, role 
   FROM users 
   WHERE auth_provider = 'ldap';
   ```

## Troubleshooting

### Common Issues

1. **LDAP Connection Timeout**
   - Check LDAP server URL and port
   - Verify network connectivity
   - Check firewall settings

2. **Authentication Failures**
   - Verify LDAP bind credentials
   - Check search base and filter configuration
   - Ensure user exists in LDAP directory

3. **User Provisioning Errors**
   - Check required LDAP attributes are present
   - Verify email uniqueness constraints
   - Check default role configuration

### Debug Logging

The implementation includes extensive logging. Check server logs for:
- LDAP strategy configuration
- Authentication attempts
- User provisioning details
- Error messages

### Log Examples

```
=== LDAP STRATEGY CONFIGURATION ===
LDAP URL: ldap://ldap.forumsys.com:389
Search Base: dc=example,dc=com
Search Filter: (uid={{username}})
===================================

=== LDAP LOGIN ATTEMPT ===
Username: tesla
Password received: Yes

=== LDAP AUTHENTICATION SUCCESS ===
LDAP authentication successful for: uid=tesla,dc=example,dc=com

=== LDAP USER PROVISIONING ===
Creating new LDAP user
Created new LDAP user: tesla@ldap.forumsys.com
```

## Production Deployment

### LDAP Server Configuration

1. **Use your organization's LDAP server:**
   ```bash
   LDAP_URL=ldap://your-ldap-server.company.com:389
   LDAP_BIND_DN=cn=service-account,ou=service-accounts,dc=company,dc=com
   LDAP_BIND_PASSWORD=secure-service-password
   LDAP_SEARCH_BASE=ou=users,dc=company,dc=com
   ```

2. **Configure TLS/SSL:**
   ```bash
   LDAP_TLS_ENABLED=true
   LDAP_TLS_REJECT_UNAUTHORIZED=true
   ```

3. **Adjust attribute mappings:**
   ```bash
   LDAP_USERNAME_FIELD=sAMAccountName  # For Active Directory
   LDAP_EMAIL_FIELD=userPrincipalName
   LDAP_FIRSTNAME_FIELD=givenName
   LDAP_LASTNAME_FIELD=sn
   ```

### Role Management

Currently, all new LDAP users receive the default role specified in `LDAP_DEFAULT_ROLE`. For production:

1. **Set appropriate default role:**
   ```bash
   LDAP_DEFAULT_ROLE=user  # Most restrictive by default
   ```

2. **Manual role assignment:** Admins can update user roles through the user management interface

3. **Future enhancement:** Implement group-based role mapping from LDAP groups

## Future Enhancements

### Planned Features

1. **Group-Based Role Mapping**
   - Map LDAP groups to application roles
   - Automatic role assignment based on group membership

2. **Account Linking**
   - Allow linking existing local accounts with LDAP accounts
   - Migration path for existing users

3. **Advanced LDAP Features**
   - Support for LDAP referrals
   - Connection pooling
   - Failover to multiple LDAP servers

4. **Enhanced Security**
   - LDAP certificate validation
   - Audit logging for LDAP authentication events
   - Rate limiting for LDAP authentication attempts

### Configuration Examples

#### Active Directory

```bash
LDAP_URL=ldap://ad.company.com:389
LDAP_BIND_DN=cn=ldap-service,ou=service-accounts,dc=company,dc=com
LDAP_BIND_PASSWORD=service-password
LDAP_SEARCH_BASE=ou=users,dc=company,dc=com
LDAP_SEARCH_FILTER=(sAMAccountName={{username}})
LDAP_USERNAME_FIELD=sAMAccountName
LDAP_EMAIL_FIELD=userPrincipalName
LDAP_FIRSTNAME_FIELD=givenName
LDAP_LASTNAME_FIELD=sn
```

#### OpenLDAP

```bash
LDAP_URL=ldap://openldap.company.com:389
LDAP_BIND_DN=cn=admin,dc=company,dc=com
LDAP_BIND_PASSWORD=admin-password
LDAP_SEARCH_BASE=ou=people,dc=company,dc=com
LDAP_SEARCH_FILTER=(uid={{username}})
LDAP_USERNAME_FIELD=uid
LDAP_EMAIL_FIELD=mail
LDAP_FIRSTNAME_FIELD=givenName
LDAP_LASTNAME_FIELD=sn
```

## Support

For issues or questions regarding LDAP authentication:

1. Check the troubleshooting section above
2. Review server logs for error details
3. Verify LDAP server connectivity and configuration
4. Test with the provided test script
5. Consult your LDAP administrator for directory-specific issues

## Summary

The LDAP authentication integration provides:

- ✅ Seamless authentication against LDAP directories
- ✅ Automatic user provisioning with local shadow users
- ✅ Consistent session management for all users
- ✅ Role-based access control integration
- ✅ Comprehensive logging and error handling
- ✅ Production-ready security considerations
- ✅ Extensive testing and documentation

The implementation maintains backward compatibility with existing local authentication while adding enterprise-grade LDAP support for organizations requiring centralized authentication. 