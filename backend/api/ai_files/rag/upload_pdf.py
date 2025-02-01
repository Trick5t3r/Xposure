import boto3
import os


BUCKET_NAME = "yessin-project"
FILE_PATH = r"C:\Users\ahmed\Desktop\tong2023minibatchot.pdf"


def upload_pdf_to_s3(file_path, bucket_name, object_name=None):
    if not file_path.lower().endswith(".pdf"):
        return None

    if object_name is None:
        object_name = os.path.basename(file_path)

    s3_client = boto3.client("s3")

    try:
        s3_client.upload_file(file_path, bucket_name, object_name)
        return f"https://{bucket_name}.s3.amazonaws.com/%7Bobject_name%7D"
    except Exception as e:
        return None


if __name__ == "__main__":
    print(upload_pdf_to_s3(FILE_PATH, BUCKET_NAME))
