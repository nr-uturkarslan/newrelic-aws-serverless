import os
import json
import datetime
import boto3

s3Client = boto3.client("s3")

def log(message):
  print("storer:{}".format(message))

def prepareResponse(success, message):
  response = {
    "statusCode": 200,
    "body": {
      "success": success,
      "message": message,
    }
  }

  log(response)
  return response

def lambda_handler(event, context):

  log("Lambda is triggered.")

  # Get bucket name
  bucketName = os.getenv('S3_BUCKET_NAME')
  if bucketName == None:
    return prepareResponse(False, "No bucket name is provided.")

  # Parse request body
  try:
    encodedString = json.dumps(event).encode("utf-8")
  except:
    return prepareResponse(False, "Failed to parse request body.")

  # Store in S3
  try:
    fileName = "{}.json".format(datetime.datetime.now(datetime.timezone.utc))
    s3Client.put_object(
      Bucket = bucketName,
      Key = fileName,
      Body = encodedString
    )
  except Exception as e:
    log(e)
    return prepareResponse(False, "File is failed to be stored in S3.")

  return prepareResponse(True, "File is stored in S3 successfully.")
