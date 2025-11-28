#!/usr/bin/env python
"""
Seed script for CasePilot database.
Creates test users, clients, cases, and tasks for local development.

Usage:
    cd backend
    python seed.py
"""

from app.database import SessionLocal
from app.models import User, Client, Case, Task, UserRole, CaseStatus, TaskStatus, TaskPriority
from app.auth import get_password_hash
from datetime import date

def seed():
    db = SessionLocal()
    try:
        print("🌱 Seeding database...")

        # Seed users
        if db.query(User).count() == 0:
            owner = User(
                email="owner@firm.com",
                hashed_password=get_password_hash("password"),
                full_name="John Owner",
                role=UserRole.OWNER
            )
            lawyer = User(
                email="lawyer@firm.com",
                hashed_password=get_password_hash("password"),
                full_name="Jane Lawyer",
                role=UserRole.LAWYER
            )
            assistant = User(
                email="assistant@firm.com",
                hashed_password=get_password_hash("password"),
                full_name="Bob Assistant",
                role=UserRole.ASSISTANT
            )
            db.add_all([owner, lawyer, assistant])
            db.commit()
            print("✅ Seeded 3 users")
        else:
            # Update existing users with new password hashes
            owner = db.query(User).filter(User.email == "owner@firm.com").first()
            if owner:
                owner.hashed_password = get_password_hash("password")
            lawyer = db.query(User).filter(User.email == "lawyer@firm.com").first()
            if lawyer:
                lawyer.hashed_password = get_password_hash("password")
            assistant = db.query(User).filter(User.email == "assistant@firm.com").first()
            if assistant:
                assistant.hashed_password = get_password_hash("password")
            db.commit()
            print("✅ Updated user passwords")

        # Seed client
        if db.query(Client).count() == 0:
            client = Client(
                name="Smith & Associates",
                email="contact@smith.com",
                phone="555-0100",
                address="123 Main St, New York, NY 10001"
            )
            db.add(client)
            db.commit()
            print("✅ Seeded 1 client")

        # Seed case
        if db.query(Case).count() == 0:
            lawyer_user = db.query(User).filter(User.email == "lawyer@firm.com").first()
            client = db.query(Client).first()
            if lawyer_user and client:
                case = Case(
                    title="Smith vs. Jones",
                    description="Civil litigation case",
                    status=CaseStatus.OPEN,
                    primary_attorney_id=lawyer_user.id,
                    client_id=client.id
                )
                db.add(case)
                db.commit()
                print("✅ Seeded 1 case")

        # Seed tasks
        if db.query(Task).count() == 0:
            case = db.query(Case).first()
            if case:
                task1 = Task(
                    title="Review documents",
                    description="Review case documents",
                    status=TaskStatus.PENDING,
                    priority=TaskPriority.HIGH,
                    due_date=date(2025, 12, 15),
                    case_id=case.id
                )
                task2 = Task(
                    title="Prepare discovery",
                    description="Prepare discovery requests",
                    status=TaskStatus.IN_PROGRESS,
                    priority=TaskPriority.MEDIUM,
                    due_date=date(2025, 12, 20),
                    case_id=case.id
                )
                db.add_all([task1, task2])
                db.commit()
                print("✅ Seeded 2 tasks")

        print("\n✨ Database seeding complete!")
        print("\n🔐 Test credentials:")
        print("  Owner:     owner@firm.com / password")
        print("  Lawyer:    lawyer@firm.com / password")
        print("  Assistant: assistant@firm.com / password")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
