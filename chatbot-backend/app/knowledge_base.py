# app/knowledge_base.py

# Facts: things that are always true in your system
facts = {
    "main entrance is connected to cafeteria": True,
    "cafeteria is connected to paper recycling": True,
    "paper recycling is connected to metal recycling": True,
    "reception is connected to loading dock": True,
    "plastic recycling is connected to compost area": True,
    "electronics recycling is connected to recycling zone": True,
}

# Rules: simple implications or logic-based conditions
rules = {
    "if main entrance is connected to cafeteria and cafeteria is connected to paper recycling": "main entrance has access to paper recycling",
    "if reception is connected to loading dock and plastic recycling is connected to compost area": "reception is in recycling area"
}

def search_knowledge_base(user_input):
    if "recycle" in user_input.lower():
        return "You can recycle plastic, paper, and glass items."
    return None
