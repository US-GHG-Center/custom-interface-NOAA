import os
import json
import uuid
import http.client
import time
from base64 import b64encode
import argparse

def check_dag_status(dag_id, dag_run_id, http_conn, headers):
    while True:
        # Make request to get the DAG run status
        http_conn.request(
            "GET",
            f"/api/v1/dags/{dag_id}/dagRuns/{dag_run_id}",
            headers=headers,
        )
        response = http_conn.getresponse()
        response_data = response.read()
        dag_run = json.loads(response_data.decode())
        dag_state = dag_run["state"]
        
        print(f"Current DAG state: {dag_state}")

        if dag_state in ["success", "failed"]:
            return dag_state

        # Wait for 30 seconds before checking again
        print("Waiting for DAG to finish...")
        time.sleep(30)

def ingest_features(dag_config_file):
    # Read config from JSON file
    with open(dag_config_file, "r") as file:
        payload = json.load(file)
    print("DAG Config", payload)

    base_api_url = os.getenv("SM2A_API_URL")
    vector_ingest_dag = os.getenv("DATASET_DAG_NAME")
    username = os.getenv("SM2A_ADMIN_USERNAME")
    password = os.getenv("SM2A_ADMIN_PASSWORD")

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
    dag_run_id = f"{vector_ingest_dag}-{uuid.uuid4()}"
    body = {
        **dag_payload,
        "dag_run_id": dag_run_id,
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
    response_json = json.loads(response_data.decode())

    if response.status != 200:
        raise RuntimeError(f"Failed to trigger DAG: {response_json}")

    print(f"DAG triggered successfully with run_id: {dag_run_id}")
    print(f"Check status of your dag at {base_api_url}/dags/{vector_ingest_dag}/grid?dag_run_id={dag_run_id}")

    # Check status until completion
    dag_state = check_dag_status(vector_ingest_dag, dag_run_id, http_conn, headers)
    http_conn.close()

    if dag_state == "success":
        print("✅ DAG completed successfully.")
    else:
        raise RuntimeError(f"❌ DAG failed with state: {dag_state}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest collection to Features API")
    parser.add_argument("dag_config_file", help="Path to the DAG config JSON file")
    args = parser.parse_args()

    ingest_features(args.dag_config_file)
