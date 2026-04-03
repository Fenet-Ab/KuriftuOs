from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.staff import Staff
from app.models.guest import Guest
from app.core.security import hash_password, verify_password, create_access_token

VALID_ROLES = {"guest", "staff", "manager", "admin"}


def _normalize_role(role: str | None, default: str = "guest") -> str:
    return (role or default).strip().lower()


# Register staff
async def register_staff(db: AsyncSession, staff_data, creator_role: str | None = None):
    requested_role = _normalize_role(staff_data.role, default="guest")
    creator_role = _normalize_role(creator_role, default="")

    if requested_role not in VALID_ROLES:
        raise ValueError("Invalid role. Use one of: guest, staff, manager, admin.")

    # Public signup defaults to guest only.
    if creator_role == "":
        if requested_role != "guest":
            raise PermissionError("Public registration can only create guest accounts.")
    elif creator_role == "manager":
        if requested_role != "staff":
            raise PermissionError("Manager can only register staff.")
    elif creator_role == "admin":
        if requested_role not in {"staff", "manager"}:
            raise PermissionError("Admin can register only staff or manager.")
    else:
        raise PermissionError("Only manager/admin can create staff accounts.")

    existing = await db.execute(select(Staff).where(Staff.email == staff_data.email))
    if existing.scalar_one_or_none():
        raise ValueError("Email already registered.")

    hashed_pw = hash_password(staff_data.password)

    new_guest_id = None
    if requested_role == "guest":
        # Automatically create a corresponding Guest record
        guest_record = Guest(
            name=staff_data.name, 
            phone_number=f"ACC-{staff_data.email}" # We link by email-based phone placeholder
        )
        db.add(guest_record)
        await db.flush() # Secure the guest ID
        new_guest_id = guest_record.id

    staff = Staff(
        name=staff_data.name,
        email=staff_data.email,
        password=hashed_pw,
        role=requested_role,
        guest_id=new_guest_id
    )

    db.add(staff)
    await db.commit()
    await db.refresh(staff)

    return staff

# Login staff
async def login_staff(db: AsyncSession, email: str, password: str):
    result = await db.execute(select(Staff).where(Staff.email == email))
    staff = result.scalar_one_or_none()

    if not staff:
        raise ValueError("User with this email does not exist.")

    if not verify_password(password, staff.password):
        raise ValueError("Incorrect password, please try again.")

    token = create_access_token({
        "sub": staff.email,
        "role": staff.role
    })

    return token, staff
async def update_staff(db: AsyncSession, staff: Staff, update_data):
    if update_data.name is not None:
        staff.name = update_data.name
    if update_data.avatar_url is not None:
        staff.avatar_url = update_data.avatar_url
    if update_data.email is not None:
        staff.email = update_data.email
    if update_data.password is not None:
        staff.password = hash_password(update_data.password)
    
    await db.commit()
    await db.refresh(staff)
    return staff
