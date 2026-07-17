from datetime import datetime


class UserModel:

    @staticmethod
    def create_document(name: str, email: str, password: str):
        return {
            "name": name,
            "email": email,
            "password": password,
            "created_at": datetime.utcnow()
        }