import os
import json
import uuid
import http.client
from base64 import b64encode
import sys
import argparse

def ingest_features(dag_config_file):
    # Read config from JSON file
    with open(dag_config_file, "r") as file:
        payload = json.load(file)
    print("DAG Config", payload)

    base_api_url = os.getenv("SM2A_API_URL")
    vector_ingest_dag = os.getenv("DATASET_DAG_NAME")
    username = os.getenv("SM2A_ADMIN_USERNAME")
    password = os.getenv("SM2A_ADMIN_PASSWORD")

    print("base_api_url", base_api_url)
    print("vector_ingest_dag", vector_ingest_dag)
    print("username", username)
    print("password", password[:2])

    if not base_api_url or not username or not password:
        raise ValueError(
            "SM2A_API_URL, SM2A_ADMIN_USERNAME, or SM2A_ADMIN_PASSWORD is missing in environment variables."
        )

    api_token = b64encode(f"{username}:{password}".encode()).decode()

    headers = {
        "Content-Type": "application/json",
        "Authorization": "Basic " + api_token,
    }

    dag_payload = {"conf": payload}
    body = {
        **dag_payload,
        "dag_run_id": f"{vector_ingest_dag}-{uuid.uuid4()}",
        "note": "Run from GitHub Actions ghgc-noaa-interface",
    }

    http_conn = http.client.HTTPSConnection(base_api_url)
    http_conn.request(
        "POST",
        f"/api/v1/dags/{vector_ingest_dag}/dagRuns",
        json.dumps(body),
        headers,
    )
    response = http_conn.getresponse()
    response_data = response.read()
    http_conn.close()

    print(json.dumps({"statusCode": response.status}))
    print(response_data.decode())

    return {"statusCode": response.status, "body": response_data.decode()}


if __name__ == "__main__":
    # Using argparse to handle command-line arguments
    parser = argparse.ArgumentParser(description="Ingest collection to Features API")
    parser.add_argument("dag_config_file", help="Path to the DAG config JSON file")
    args = parser.parse_args()

    ingest_features(args.dag_config_file)
