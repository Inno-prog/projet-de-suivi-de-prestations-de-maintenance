# TODO - Fix 403 Forbidden on /api/structures-mefp

## Issue Analysis
- Frontend is in development mode with `useMockAuth: true`, so no Authorization header is sent
- Backend should allow all `/api/**` requests in development without authentication
- Currently getting 403 Forbidden, indicating authentication is still required

## Tasks
- [ ] Verify backend is running in development mode (not production profile)
- [ ] Update WebSecurityConfig to ensure proper development authentication bypass
- [ ] Test the fix by attempting to create a structure via frontend
- [ ] If still failing, check if OAuth2 resource server is accidentally enabled

## Files to Check/Modify
- backend/src/main/java/com/dgsi/maintenance/security/WebSecurityConfig.java
- backend/src/main/resources/application.properties
- frontend/src/environments/environment.ts (confirm useMockAuth: true)
