from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain_community.utilities.sql_database import SQLDatabase
from langchain import hub
from langgraph.prebuilt import create_react_agent
from langchain.chat_models import init_chat_model
from twilio.rest import Client
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db, init_app,User,Expense



load_dotenv()
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///expenses.db"
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_ACCOUNT_SID = "AC69ee94d756ec419887e0130803887697"
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
print(TWILIO_PHONE_NUMBER)
print(TWILIO_AUTH_TOKEN)
print(TWILIO_ACCOUNT_SID)
init_app(app)
migrate = Migrate(app, db)
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def create_agent():
    llm = init_chat_model("gemini-1.5-flash", model_provider="google_genai")
    db = SQLDatabase.from_uri("sqlite:///instance/expenses.db")
    toolkit = SQLDatabaseToolkit(db=db, llm=llm)
    toolkit.get_tools()

    prompt_template = hub.pull("langchain-ai/sql-agent-system-prompt")
    system_message = prompt_template.format(dialect="SQLite", top_k=5)

    agent_executor = create_react_agent(
        llm, toolkit.get_tools(), state_modifier=system_message
    )
    return agent_executor


def process_user_query(user_phone, user_query,categories):
    agent_executor = create_agent()
    example_query = f"""
    You are a expense tracker and manager bot which help users to track there expenses and manage it and provide a detailed breakdown of the total expenses incurred by the user.
    Can you provide a resolution to the following query for user with user_phone {user_phone}?
    The user phone is in structure *whatsapp:+91XXXXXXXXXX*
    <User Query>:
    {user_query}
    </User Query>
    If the user tells he spend money then add it in the expenses table.
    If the user asks for the expenses then provide the expenses in each category with decription and date of spend and total expenses.
    Also if the user has exceeded the budget then provide a warning message.
    Present the response in a visually appealing manner with all descriptions using emojis and a light joke for user for his day.
    """
    events = agent_executor.stream(
        {"messages": [("user", example_query)]}, stream_mode="values"
    )
    last_response = ""
    for event in events:
        last_response = event["messages"][-1].content
        event["messages"][-1].pretty_print()
        
    return last_response


@app.route("/whatsapp", methods=["POST"])
def whatsapp():
    parsed_msg = request.form
    from_number = parsed_msg.get("From")
    incoming_msg = parsed_msg.get("Body", "").strip()
    if not incoming_msg:
        return jsonify({"message": "❌ Please provide a message."}, 400)
    user = db.session.query(User).filter_by(user_phone=from_number).first()
    categories = "["
    if not user:
       user = User(user_phone=from_number, limit_amount=1000)
       db.session.add(user)
       db.session.commit() 
    expense_user = Expense.query.filter_by(user_id=user.id).all()
    for expense in expense_user:
        categories += expense.category + ","
    categories += "]"
    

    response_message = process_user_query(from_number, incoming_msg,categories=categories)
    message = client.messages.create(
     body=response_message,
        from_=TWILIO_PHONE_NUMBER,
        to=from_number)
    return jsonify({"message": "✅ Message sent successfully."}, 200)


if __name__ == "__main__":
    app.run(debug=False)
# response_message = process_user_query(
#     "9876543210", "Tell me expenses in groceries for this month"
# )
# print(response_message)
