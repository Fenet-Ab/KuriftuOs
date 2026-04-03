from pydantic import BaseModel

class GuestCreate(BaseModel):
    phone_number: str
    name: str
    language_pref: str = "en"

class GuestResponse(BaseModel):
    id: int
    phone_number: str
    name: str
    language_pref: str

    class Config:
        from_attributes = True