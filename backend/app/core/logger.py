from loguru import logger
from pathlib import Path
import sys


# Ensure logs directory exists before adding file handler
Path("logs").mkdir(exist_ok=True)

logger.remove()

logger.add(
    sys.stdout,
    level="INFO",
    format="<green>{time}</green> | <level>{level}</level> | {message}",
)

logger.add(
    "logs/app.log",
    rotation="10 MB",
    retention="10 days",
    level="INFO",
)


app_logger = logger