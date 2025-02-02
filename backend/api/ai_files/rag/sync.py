import boto3

client = boto3.client("bedrock-agent")

knowledgeBaseId = "0HJFVZSCOS"
dataSourceId = "RLX00FXPNP"


def start_ingestion_job():
    response = client.start_ingestion_job(
        knowledgeBaseId=knowledgeBaseId,
        dataSourceId=dataSourceId,
    )
    return response


