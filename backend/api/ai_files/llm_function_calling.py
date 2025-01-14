import os
import json
from mistralai import Mistral
from dotenv import load_dotenv
import functools
import copy

# Configuration Mistral
model = "mistral-small-latest"
api_key = os.environ.get("MISTRAL_API_KEY")
client = Mistral(api_key=api_key)

# Exemple d'outils pour Mistral
tools = [
    {
        "type": "function",
        "function": {
            "name": "update_first_label",
            "description": "Update the first label.",
            "parameters": {
                "type": "object",
                "properties": {
                    "label": {
                        "type": "string",
                        "description": "The new value for the first label."
                    }
                },
                "required": ["label"]
            },
        },
    }
]

def update_first_label(label, instance=None):
    instance.datas[0]["data"]["labels"][0] = label
    return f"Update first label with {label}"


def generate_names_to_functions(tools, instance):
    """
    Generate a dictionary mapping function names to partially applied functions using a given DataFrame.

    Args:
        tools (list): A list of dictionaries containing function metadata.
        df (DataFrame): The DataFrame to bind to the functions.

    Returns:
        dict: A dictionary mapping function names to functools.partial objects.
    """
    names_to_functions = {}

    for tool in tools:
        if tool["type"] == "function":
            function_name = tool["function"]["name"]
            # Assuming the function is defined globally and can be accessed by name
            if function_name in globals():
                function = globals()[function_name]
                names_to_functions[function_name] = functools.partial(function, instance=instance)

    return names_to_functions

def execute_function(function_name: str, function_params, instance=None):
    """
    Exécute une fonction définie avec les arguments donnés.
    """
    names_to_functions = generate_names_to_functions(tools, instance)
    return names_to_functions[function_name](**function_params)

def llm_pipeline(instance):
    """
    Pipeline principale pour traiter le contexte et générer une réponse.
    """
    # Étape 1: Préparation des messages pour Mistral
    messages = copy.copy(instance.messages)

    # Étape 2: Appel au modèle Mistral pour déterminer la fonction et les arguments
    response = client.chat.complete(
        model=model,
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )

    if response.choices[0].message.tool_calls is None:
        instance.messages.append({"role": "assistant", "content": response.choices[0].message.content})
        return
    try:
        messages.append(response.choices[0].message)
        tool_call = response.choices[0].message.tool_calls[0]
        print(tool_call)
        function_name = tool_call.function.name
        function_params = json.loads(tool_call.function.arguments)
        print("\nfunction_name: ", function_name, "\nfunction_params: ", function_params)
    except Exception as e:
        return f"Error parsing tool call: {str(e)}"

    # Étape 3: Exécution de la fonction
    function_result = execute_function(function_name, function_params, instance)

    # Ajout du résultat dans les messages
    messages.append({
        "role": "tool", 
        "name": function_name, 
        "content": function_result, 
        "tool_call_id": tool_call.id
    })

    # Étape 4: Génération de la réponse finale
    rep = client.chat.complete(
        model=model,
        messages=messages
    )

    instance.messages.append({"role": "assistant", "content": rep.choices[0].message.content})
