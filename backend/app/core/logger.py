from loguru import logger
import sys


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