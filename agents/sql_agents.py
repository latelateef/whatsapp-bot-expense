from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain_community.utilities.sql_database import SQLDatabase
from langchain import hub
from langgraph.prebuilt import create_react_agent
from langchain.chat_models import init_chat_model
from langchain.chat_models import init_chat_model
import os
from dotenv import load_dotenv

load_dotenv()
from langchain_google_genai import ChatGoogleGenerativeAI

llm = init_chat_model("gemini-1.5-flash", model_provider="google_genai")
db = SQLDatabase.from_uri("sqlite:///expenses.db")
toolkit = SQLDatabaseToolkit(db=db, llm=llm)
toolkit.get_tools()

# Pull prompt (or define your own)
prompt_template = hub.pull("langchain-ai/sql-agent-system-prompt")
system_message = prompt_template.format(dialect="SQLite", top_k=5)

# Create agent
agent_executor = create_react_agent(
    llm, toolkit.get_tools(), state_modifier=system_message
)

# Query agent
example_query = f"""Can you provide a detailed breakdown of the total expenses incurred by the user with the phone number 9876543210?
Present the response in a visually appealing manner using emojis and a thought for the day or a light joke for user.
    """

events = agent_executor.stream(
    {"messages": [("user", example_query)]},
    stream_mode="values",
)
for event in events:
    event["messages"][-1].pretty_print()
