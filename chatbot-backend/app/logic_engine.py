# app/logic_engine.py

from app.knowledge_base import facts, rules

def handle_query(query):
    query = query.lower().strip()

    # Directly check if the query is a known fact
    if query in facts:
        return f"✅ Yes, it's true that {query}."
    
    # Search rules to infer something
    for condition, conclusion in rules.items():
        parts = condition.replace("if ", "").split(" and ")
        if all(facts.get(p.strip(), False) for p in parts):
            if query == conclusion:
                return f"🧠 Inferred: {conclusion} based on known connections."
    
    return "🤷 Sorry, I don't have enough information to infer that."

def handle_logic(user_input):
    if "hi" in user_input.lower():
        return "Hello! How can I help you today?"
    return None
