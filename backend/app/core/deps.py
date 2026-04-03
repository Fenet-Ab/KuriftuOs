"""
FastAPI dependencies shared across endpoints.
  - get_current_staff  : validates JWT, returns Staff model
  - require_manager    : same but enforces MANAGER/ADMIN role
  - require_admin      : enforces ADMIN role only
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.db.models.staff import Staff, StaffRole
from app.services.auth_service import AuthService

bearer_scheme = HTTPBearer()


async def get_current_staff(
    credential: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Staff:
    token = credential.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") == "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    staff_id = int(payload["sub"])
    svc = AuthService(db)
    staff = await svc.get_staff_by_id(staff_id)
    if not staff or not staff.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return staff


async def require_manager(
    staff: Staff = Depends(get_current_staff),
) -> Staff:
    if staff.role not in (StaffRole.MANAGER, StaffRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager or admin role required",
        )
    return staff


async def require_admin(
    staff: Staff = Depends(get_current_staff),
) -> Staff:
    if staff.role != StaffRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required"
        )
    return staff
