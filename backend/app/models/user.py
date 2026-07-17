from datetime import datetime


class UserModel:

    @staticmethod
    def create_document(full_name: str, email: str, password: str):
        return {
            "full_name": full_name,
            "email": email,
            "password": password,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }