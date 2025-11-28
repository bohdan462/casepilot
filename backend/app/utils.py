from app import models
from app.models import UserRole

def can_access_case(user: models.User, case: models.Case) -> bool:
    """Check if user can access a case"""
    if user.role == UserRole.OWNER:
        return True
    if case.primary_attorney_id == user.id:
        return True
    # Check if user is assigned as assistant
    for assistant in case.case_assistants:
        if assistant.assistant_id == user.id:
            return True
    return False




