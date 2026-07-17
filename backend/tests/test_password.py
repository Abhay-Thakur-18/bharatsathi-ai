import sys
from pathlib import Path

sys.path.append(
    str(Path(__file__).resolve().parent.parent)
)

from app.api.auth.service import hash_password, verify_password


password = "abhay123"

hashed = hash_password(password)

print("Hashed Password:")
print(hashed)

result = verify_password(
    password,
    hashed
)

print("Password Match:")
print(result)