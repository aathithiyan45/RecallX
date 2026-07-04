from core.logger import logger
from ai.prompts.prompt_builder import prompt_builder

results = [
    {
        "document":
        "Java is an object oriented language."
    },
    {
        "document":
        "Collections store objects."
    }
]

prompt = prompt_builder.build(

    "What are Collections?",

    results

)

logger.info(prompt)