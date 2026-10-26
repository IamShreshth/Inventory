import { describe, expect, it } from 'vitest';
import {
  assignAdminOrg,
  getAdminOrgIds,
  requireAdmin,
  requireReadAccess,
  requireRole,
  requireSuperAdmin,
} from '../../src/middleware/authorize.js';

function run(middleware, user, body) {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
  let nextCalled = false;
  middleware({ user, validated: { body } }, response, () => {
    nextCalled = true;
  });
  return { response, nextCalled };
}

describe('role authorization', () => {
  const borrower = { id: 'borrower', roles: [{ role: 'borrower' }] };
  const scopedAdmin = {
    id: 'admin',
    roles: [{ role: 'org_admin', org_unit_id: 'org-1' }],
  };
  const superAdmin = { id: 'root', roles: [{ role: 'super_admin' }] };

  it('allows borrowers to read but not administer', () => {
    expect(run(requireReadAccess, borrower).nextCalled).toBe(true);
    expect(run(requireAdmin, borrower).response.statusCode).toBe(403);
  });

  it('keeps borrowers out of administrative reports', () => {
    const reportAccess = requireRole('super_admin', 'org_admin', 'berm_incharge', 'auditor');
    expect(run(reportAccess, borrower).response.statusCode).toBe(403);
    expect(run(reportAccess, scopedAdmin).nextCalled).toBe(true);
  });

  it('limits administrator org assignments to their assigned units', () => {
    expect(getAdminOrgIds(scopedAdmin)).toEqual(['org-1']);
    const accepted = run(assignAdminOrg('org_unit_id'), scopedAdmin, {});
    expect(accepted.nextCalled).toBe(true);
    expect(accepted.response.statusCode).toBe(200);
    expect(accepted.response.body).toBeNull();
  });

  it('rejects an organization outside the administrator scope', () => {
    const result = run(assignAdminOrg('org_unit_id'), scopedAdmin, { org_unit_id: 'org-2' });
    expect(result.response.statusCode).toBe(403);
    expect(result.nextCalled).toBe(false);
  });

  it('allows superadmins to administer globally', () => {
    expect(getAdminOrgIds(superAdmin)).toBeNull();
    expect(run(requireSuperAdmin, superAdmin).nextCalled).toBe(true);
  });
});
