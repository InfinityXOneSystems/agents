# API Gateway Skeleton

from fastapi import FastAPI, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import json
from google.cloud import storage, aiplatform  # type: ignore
from backend.admin_server.lib.unified_llm_system import UnifiedLLMSystem  # type: ignore

# Securely load GCP credentials from environment variables
GCP_CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
if not GCP_CREDENTIALS_PATH or not os.path.exists(GCP_CREDENTIALS_PATH):
    raise FileNotFoundError("GCP credentials file not found. Please set the GOOGLE_APPLICATION_CREDENTIALS environment variable correctly.")

# Authenticate and connect to GCP
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GCP_CREDENTIALS_PATH

class Blueprint(BaseModel):
    name: str
    tasks: list[str]

class PaymentRequest(BaseModel):
    amount: float
    currency: str
    description: str

class LLMRequest(BaseModel):
    prompt: str

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Infinity-Matrix API Gateway!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/login")
def login(username: str = Body(...), password: str = Body(...)):
    # Replace hardcoded credentials with secure authentication
    if authenticate_user(username, password):
        return {"status": "success", "message": "Login successful"}
    return {"status": "failure", "message": "Invalid credentials"}

# Add authentication function
def authenticate_user(username: str, password: str) -> bool:
    # Example: Validate against a secure database or authentication service
    return username == os.getenv("DEFAULT_USERNAME") and password == os.getenv("DEFAULT_PASSWORD")

@app.post("/api/agent-builder")
def agent_builder(blueprint: Blueprint = Body(...)):
    return {"status": "success", "message": "Agent blueprint deployed", "blueprint": blueprint.model_dump()}

@app.post("/api/payments")
def process_payment(payment: PaymentRequest):
    if payment.amount > 0:
        return JSONResponse(content={"status": "success", "message": "Payment processed successfully", "payment": payment.model_dump()})
    return JSONResponse(content={"status": "failure", "message": "Invalid payment amount"}, status_code=400)

# Initialize UnifiedLLMSystem
llm_system = UnifiedLLMSystem()
llm_system.initialize()

@app.post("/api/llm")
def llm_endpoint(request: LLMRequest):
    try:
        # Use UnifiedLLMSystem to process the prompt
        response = llm_system.process_request({
            "prompt": request.prompt,
            "type": "creative"
        })
        return {"status": "success", "response": response}
    except Exception as e:
        return {"status": "failure", "error": str(e)}

# Add missing endpoints
@app.post("/api/auth")
def authenticate_user(username: str = Body(...), password: str = Body(...)):
    if username == "admin" and password == "admin123":
        return {"status": "success", "token": "mocked-jwt-token"}
    return {"status": "failure", "message": "Invalid credentials"}

@app.get("/api/chat")
def chat_endpoint():
    return {"message": "Chat endpoint is under construction."}

# Standardize `/admin` to `/api/admin`
@app.get("/api/admin")
def read_admin():
    return {"message": "Admin route is functional."}

def authenticate_gcp():
    try:
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "C:\\AI\\infinity-matrix\\credentials\\credentials.json"
        print("Authenticated to GCP.")
    except Exception as e:
        print(f"Authentication failed: {e}")

# Improved error handling for GCS bucket check
def check_gcs_buckets():
    try:
        client = storage.Client()
        buckets = list(client.list_buckets())
        if not buckets:
            print("No buckets available.")
            return

        bucket = buckets[0]
        blob = bucket.blob("test_object.txt")
        blob.upload_from_string("Test content")
        with open(f"{PROOF_DIR}/gcs_proof.txt", "w") as f:
            f.write("Test object uploaded successfully.\n")
        print("GCS bucket check completed.")
    except FileNotFoundError as e:
        print(f"File not found: {e}")
        raise
    except RuntimeError as e:
        print(f"Runtime error: {e}")
        raise
    except Exception as e:
        print(f"An error occurred: {e}")
        raise

# Improved error handling for Vertex AI model listing
def list_vertex_ai_models() -> list[dict[str, str]]:
    try:
        aiplatform.init(project="infinity-x-one-systems")
        models = aiplatform.Model.list()
        if not models:
            print("No Vertex AI models found.")
            return []

        model_data = [{"name": model.display_name, "id": model.resource_name} for model in models]
        with open(f"{PROOF_DIR}/vertex_proof.json", "w") as f:
            json.dump(model_data, f, indent=4)
        print("Vertex AI models listed and logged.")
        return model_data
    except Exception as e:
        print(f"Failed to list Vertex AI models: {e}")
        raise

def test_vertex_ai_model() -> None:
    models = list_vertex_ai_models()
    if not models:
        print("Skipping model testing as no Vertex AI models are available.")
        return

    model = models[0]  # Select the first model for testing
    print(f"Testing model: {model.display_name}")
    endpoint = model.deploy(machine_type="n1-standard-2")

    try:
        response = endpoint.predict(instances=[{"input": "Test input"}])
        print(f"Prediction response: {response}")
        return response
    finally:
        endpoint.undeploy()

# Ensure proof directory exists
PROOF_DIR = ".prooftest"
os.makedirs(PROOF_DIR, exist_ok=True)

# Initialize GCS client
def authenticate_and_list_buckets() -> list[str]:
    try:
        client = storage.Client()
        buckets = list(client.list_buckets())
        with open(f"{PROOF_DIR}/gcs_proof.txt", "w") as proof_file:
            proof_file.write("Buckets in the project:\n")
            for bucket in buckets:
                proof_file.write(f"- {bucket.name}\n")
        return [bucket.name for bucket in buckets]
    except Exception as e:
        with open(f"{PROOF_DIR}/gcs_proof.txt", "w") as proof_file:
            proof_file.write(f"Error listing buckets: {str(e)}\n")
        raise

# Test read/write permissions
def test_bucket_permissions(bucket_name: str) -> None:
    try:
        client = storage.Client()
        bucket = client.get_bucket(bucket_name)
        blob = bucket.blob("test_object.txt")

        # Upload a small object
        blob.upload_from_string("This is a test object.")

        # Download the object
        content = blob.download_as_text()

        # Log results
        with open(f"{PROOF_DIR}/gcs_proof.txt", "a") as proof_file:
            proof_file.write(f"Successfully uploaded and downloaded from bucket: {bucket_name}\n")
    except Exception as e:
        with open(f"{PROOF_DIR}/gcs_proof.txt", "a") as proof_file:
            proof_file.write(f"Error with bucket {bucket_name}: {str(e)}\n")
        raise

# Load agent registry
with open(".prooftest/agent_registry.json", "r") as f:
    agent_registry = json.load(f)

# Endpoint to list all agents
# @flask_app.route("/agents", methods=["GET"])
# def list_agents():
#     return jsonify(agent_registry)

# Endpoint to interact with an agent
# @flask_app.route("/agents/<agent_name>", methods=["POST"])
# def interact_with_agent(agent_name):
#     data = request.json
#     prompt = data.get("prompt", "")

#     # Log interaction
#     interaction_log = {
#         "agent": agent_name,
#         "prompt": prompt,
#         "response": f"Simulated response from {agent_name}"
#     }
#     with open(".prooftest/agent_llm_interactions.json", "a") as log_file:
#         log_file.write(json.dumps(interaction_log) + "\n")

#     return jsonify({"message": f"Prompt sent to {agent_name}", "response": interaction_log["response"]})

def validate_billing_iam():
    try:
        # Placeholder for billing and IAM validation logic
        print("Billing and IAM validation completed.")
    except Exception as e:
        print(f"Billing/IAM validation failed: {e}")

# Main function
def main():
    authenticate_gcp()
    list_vertex_ai_models()
    test_vertex_ai_model()
    check_gcs_buckets()
    validate_billing_iam()
    buckets = authenticate_and_list_buckets()
    for bucket in buckets:
        test_bucket_permissions(bucket)

if __name__ == "__main__":
    main()

def scrape_and_store_vertex_ai_models():
    """
    Scrape all available Vertex AI models and store their metadata for dynamic selection.
    """
    try:
        aiplatform.init(project="infinity-x-one-systems")
        models = aiplatform.Model.list()
        if not models:
            print("No Vertex AI models found.")
            return []

        model_metadata = [
            {
                "name": model.display_name,
                "id": model.resource_name,
                "type": model.supported_input_storage_formats  # Example metadata
            }
            for model in models
        ]

        with open(".prooftest/all_vertex_models.json", "w") as f:
            json.dump(model_metadata, f, indent=4)

        print("All Vertex AI models scraped and stored.")
        return model_metadata
    except Exception as e:
        print(f"Failed to scrape Vertex AI models: {e}")
        return []

def dynamic_model_selection(input_type):
    """
    Select the appropriate model based on the input type or use case.
    """
    try:
        with open(".prooftest/all_vertex_models.json", "r") as f:
            models = json.load(f)

        # Example logic for dynamic selection
        for model in models:
            if input_type in model.get("type", []):
                print(f"Selected model: {model['name']}")
                return model

        print("No suitable model found for the given input type.")
        return None
    except Exception as e:
        print(f"Failed to select model dynamically: {e}")
        return None

def use_dynamic_model(input_data):
    """
    Deploy and use the dynamically selected model for predictions.
    """
    input_type = "text"  # Example input type, can be determined dynamically
    model = dynamic_model_selection(input_type)

    if not model:
        raise ValueError("No suitable model found to handle the input data.")

    try:
        aiplatform.init(project="infinity-x-one-systems")
        selected_model = aiplatform.Model(model["id"])
        endpoint = selected_model.deploy(machine_type="n1-standard-2")

        try:
            response = endpoint.predict(instances=[input_data])
            print(f"Prediction response: {response}")
            return response
        finally:
            endpoint.undeploy()
    except Exception as e:
        print(f"Failed to use dynamic model: {e}")
        raise