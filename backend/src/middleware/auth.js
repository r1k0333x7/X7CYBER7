// Authentication has been removed. The platform runs open (no login/register).
// These middlewares are now no-ops that inject a fixed system user so that
// existing routes referencing req.user continue to work unchanged.

export const SYSTEM_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'system@x7.local',
  role: 'admin'
};

export function authenticate(req, _res, next) {
  req.user = SYSTEM_USER;
  next();
}

// RBAC guard is a pass-through now (single system user has full access).
export function authorize() {
  return (req, _res, next) => {
    req.user = req.user || SYSTEM_USER;
    next();
  };
}
