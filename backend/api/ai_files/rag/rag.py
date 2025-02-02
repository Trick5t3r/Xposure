import boto3

REGION_NAME = "us-west-2"
knowledgeBaseId = "0HJFVZSCOS"

bedrock_agent_runtime_client = boto3.client(
    "bedrock-agent-runtime", region_name=REGION_NAME
)
model_id = "anthropic.claude-instant-v1"
model_arn = f"arn:aws:bedrock:{REGION_NAME}::foundation-model/{model_id}"

def get_knowledge_base(query):
    query = f"Génère moi un contexte pour la question suivante : {query}"

    response = bedrock_agent_runtime_client.retrieve_and_generate(
        input={"text": query},
        retrieveAndGenerateConfiguration={
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": knowledgeBaseId,
                "modelArn": model_arn,
            },
        },
    )

    generated_text = response["output"]["text"]
    return generated_text

