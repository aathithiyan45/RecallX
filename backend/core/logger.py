import logging
import sys

# Configure standard formatting for all loggers
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Root/main logger for RecallX
logger = logging.getLogger("RecallX")
