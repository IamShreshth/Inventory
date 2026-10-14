// src/middleware/authorize.js

/**
 * Authorization middleware factory
 * Checks if the authenticated user has the required role(s) and scope
 */

const formatError = (code, message) => ({
  error: { code, message, details: [] },
});

/**
 * Check if user has any of the specified roles
 * @param {Array<string>} allowedRoles - Array of role names
 * @returns {Function} Express middleware
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(formatError('UNAUTHORIZED', 'Authentication required'));
    }

    const userRoles = req.user.roles.map((r) => r.role);
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json(formatError('FORBIDDEN', 'Insufficient permissions'));
    }

    next();
  };
}

/**
 * Check if user has a specific role within a specific org unit
 * @param {Array<string>} allowedRoles - Array of role names
 * @param {Function} getOrgId - Function to extract org_unit_id from request
 * @returns {Function} Express middleware
 */
export function requireOrgRole(allowedRoles, getOrgId) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(formatError('UNAUTHORIZED', 'Authentication required'));
    }

    const orgId = typeof getOrgId === 'function' ? getOrgId(req) : null;
    
    // super_admin bypasses org scope checks
    const isSuperAdmin = req.user.roles.some((r) => r.role === 'super_admin');
    if (isSuperAdmin) {
      return next();
    }

    // Check if user has the required role in the specified org
    const hasOrgRole = req.user.roles.some((r) => {
      const roleMatches = allowedRoles.includes(r.role);
      const orgMatches = !orgId || r.org_unit_id === orgId;
      return roleMatches && orgMatches;
    });

    if (!hasOrgRole) {
      return res.status(403).json(formatError('FORBIDDEN', 'Insufficient permissions for this organization'));
    }

    next();
  };
}

/**
 * Check if user is accessing their own resource
 * @param {Function} getUserId - Function to extract user_id from request
 * @returns {Function} Express middleware
 */
export function requireSelfOrRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(formatError('UNAUTHORIZED', 'Authentication required'));
    }

    const targetUserId = req.params.id || req.validated?.params?.id;
    const isSelf = targetUserId === req.user.id;

    if (isSelf) {
      return next();
    }

    // Check if user has privileged role
    const userRoles = req.user.roles.map((r) => r.role);
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json(formatError('FORBIDDEN', 'You can only access your own resources'));
    }

    next();
  };
}

/**
 * Policy helper functions for complex authorization logic
 */
export const can = {
  /**
   * Check if user can perform an action on users
   */
  manageUsers: (user) => {
    const roles = user.roles.map((r) => r.role);
    return roles.includes('super_admin') || roles.includes('org_admin');
  },

  /**
   * Check if user can manage assets
   */
  manageAssets: (user, orgId = null) => {
    const roles = user.roles;
    
    // super_admin can manage all assets
    if (roles.some((r) => r.role === 'super_admin')) {
      return true;
    }

    // org_admin and berm_incharge can manage assets in their org
    if (orgId) {
      return roles.some(
        (r) =>
          (r.role === 'org_admin' || r.role === 'berm_incharge') &&
          r.org_unit_id === orgId
      );
    }

    return roles.some((r) => r.role === 'org_admin' || r.role === 'berm_incharge');
  },

  /**
   * Check if user can issue/receive assets
   */
  issueAssets: (user, orgId = null) => {
    const roles = user.roles;
    
    if (roles.some((r) => r.role === 'super_admin')) {
      return true;
    }

    if (orgId) {
      return roles.some(
        (r) =>
          (r.role === 'org_admin' || r.role === 'berm_incharge') &&
          r.org_unit_id === orgId
      );
    }

    return roles.some((r) => r.role === 'org_admin' || r.role === 'berm_incharge');
  },

  /**
   * Check if user can approve workflows (transfers, disposals, etc.)
   */
  approveWorkflows: (user, orgId = null) => {
    const roles = user.roles;
    
    if (roles.some((r) => r.role === 'super_admin')) {
      return true;
    }

    if (orgId) {
      return roles.some(
        (r) => r.role === 'org_admin' && r.org_unit_id === orgId
      );
    }

    return roles.some((r) => r.role === 'org_admin');
  },

  /**
   * Check if user has read-only access (auditor)
   */
  isAuditor: (user) => {
    return user.roles.some((r) => r.role === 'auditor');
  },

  /**
   * Check if user is a borrower
   */
  isBorrower: (user) => {
    return user.roles.some((r) => r.role === 'borrower');
  },
};
