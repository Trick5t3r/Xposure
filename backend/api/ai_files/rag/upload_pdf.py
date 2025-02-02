import boto3
import os


BUCKET_NAME = "yessin-project"


def upload_to_s3(file_path, object_name=None):
    if object_name is None:
        object_name = os.path.basename(file_path)

    s3_client = boto3.client("s3")

    try:
        s3_client.upload_file(file_path, BUCKET_NAME, object_name)
        return f"https://{BUCKET_NAME}.s3.amazonaws.com/%7Bobject_name%7D"
    except Exception as e:
        return None

