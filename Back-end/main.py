from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
import re

# For generation:
import subprocess
import tempfile
import shutil
from pathlib import Path

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI(
    title="Shipwright AI API",
    description="Backend API for Shipwright AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TechStackRequest(BaseModel):
    prompt: str
    additional_context: Optional[Dict[str, Any]] = None

class TechStack(BaseModel):
    name: Optional[str] = None
    frontend: Optional[List[str]] = []
    backend: Optional[List[str]] = []
    database: Optional[str] = None
    deployment: Optional[str] = None
    additional_tools: Optional[List[str]] = []

class TechStackResponse(BaseModel):
    tech_stack: TechStack
    confidence: float
    metadata: Optional[Dict[str, Any]] = None
    

class GenerateProjectRequest(BaseModel):
    name: str
    tech_stack: TechStack

class GenerateProjectResponse(BaseModel):
    type: str  # 'ai' or 'cli'
    project_path: str
    message: str

class GenerateFrontendRequest(BaseModel):
    name: str
    tech_stack: TechStack

class GenerateFrontendResponse(BaseModel):
    type: str  # 'ai' or 'cli'
    project_path: str
    message: str

class GenerateFullProjectRequest(BaseModel):
    name: str
    tech_stack: TechStack

class GenerateFullProjectResponse(BaseModel):
    backend: Optional[GenerateProjectResponse] = None
    frontend: Optional[GenerateFrontendResponse] = None
    cicd: Optional[str] = None
    message: str

HEAVYWEIGHT_STACKS = {".net", "node.js", "nodejs", "django"}

def is_heavyweight(stack: TechStack) -> bool:
    all_techs = set((stack.frontend or []) + (stack.backend or []) + [stack.database or "", stack.deployment or ""])
    return any(tech.lower() in HEAVYWEIGHT_STACKS for tech in all_techs)

def generate_dotnet_project(project_name: str, base_dir: Path) -> Path:
    project_dir = base_dir / project_name
    if project_dir.exists():
        shutil.rmtree(project_dir)
    try:
        subprocess.run(["dotnet", "new", "webapi", "-n", project_name], cwd=base_dir, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"dotnet new failed: {e}")
    return project_dir

def generate_nodejs_project(project_name: str, base_dir: Path) -> Path:
    project_dir = base_dir / project_name
    if project_dir.exists():
        shutil.rmtree(project_dir)
    try:
        # Create project directory
        project_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize npm project
        subprocess.run(["npm", "init", "-y"], cwd=project_dir, check=True)
        
        # Install essential dependencies
        subprocess.run(["npm", "install", "express", "typescript", "@types/node", "@types/express", "ts-node", "nodemon", "--save"], cwd=project_dir, check=True)
        
        # Create basic TypeScript configuration
        tsconfig = {
            "compilerOptions": {
                "target": "es6",
                "module": "commonjs",
                "outDir": "./dist",
                "rootDir": "./src",
                "strict": True,
                "esModuleInterop": True,
                "skipLibCheck": True,
                "forceConsistentCasingInFileNames": True
            },
            "include": ["src/**/*"],
            "exclude": ["node_modules"]
        }
        
        # Create src directory and basic files
        src_dir = project_dir / "src"
        src_dir.mkdir(exist_ok=True)
        
        # Write tsconfig.json
        with open(project_dir / "tsconfig.json", "w") as f:
            json.dump(tsconfig, f, indent=2)
        
        # Create basic Express server
        server_code = """import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the Node.js API' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
"""
        with open(src_dir / "index.ts", "w") as f:
            f.write(server_code)
        
        # Create package.json scripts
        package_json_path = project_dir / "package.json"
        with open(package_json_path, "r") as f:
            package_json = json.load(f)
        
        package_json["scripts"] = {
            "start": "node dist/index.js",
            "dev": "nodemon src/index.ts",
            "build": "tsc",
            "watch": "tsc -w"
        }
        
        with open(package_json_path, "w") as f:
            json.dump(package_json, f, indent=2)
            
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Node.js project creation failed: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating Node.js project: {e}")
    
    return project_dir

def sanitize_python_identifier(name: str) -> str:
    # Replace hyphens and spaces with underscores
    name = re.sub(r'[-\s]', '_', name)
    # Remove invalid characters (anything not alphanumeric or underscore)
    name = re.sub(r'[^0-9a-zA-Z_]', '', name)
    # Ensure it doesn't start with a number
    if re.match(r'^[0-9]', name):
        name = '_' + name
    return name

def generate_django_project(project_name: str, base_dir: Path) -> Path:
    # Sanitize project name for Django
    safe_project_name = sanitize_python_identifier(project_name)
    project_dir = base_dir / safe_project_name
    if project_dir.exists():
        shutil.rmtree(project_dir)
    try:
        # Create the project directory
        project_dir.mkdir(parents=True, exist_ok=True)
        print(f"Created project directory: {project_dir}")
        
        # Create a virtual environment
        print("Creating virtual environment...")
        subprocess.run(["python3", "-m", "venv", "venv"], cwd=project_dir, check=True)
        print("Virtual environment created successfully")
        
        # Get the path to pip in the virtual environment
        pip_path = project_dir / "venv" / "bin" / "pip"
        if not pip_path.exists():
            pip_path = project_dir / "venv" / "Scripts" / "pip.exe"  # For Windows
        
        # Install Django
        print("Installing Django...")
        subprocess.run([str(pip_path), "install", "django"], cwd=project_dir, check=True)
        print("Django installed successfully")
        
        # Get the path to django-admin in the virtual environment
        django_admin_path = project_dir / "venv" / "bin" / "django-admin"
        if not django_admin_path.exists():
            django_admin_path = project_dir / "venv" / "Scripts" / "django-admin.exe"  # For Windows
        
        # Start a new Django project
        print("Creating Django project...")
        subprocess.run([str(django_admin_path), "startproject", safe_project_name, "."], cwd=project_dir, check=True)
        print("Django project created successfully")
        
        return project_dir
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {e.cmd}")
        print(f"Error output: {e.output if hasattr(e, 'output') else 'No output'}")
        raise HTTPException(status_code=500, detail=f"Django project creation failed: {e}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating Django project: {e}")

def generate_react_project(project_name: str, base_dir: Path) -> Path:
    # npm project names must be lowercase and cannot contain spaces or capital letters
    safe_name = project_name.lower().replace(' ', '-')
    project_dir = base_dir / safe_name
    if project_dir.exists():
        shutil.rmtree(project_dir)
    try:
        # Create React project using npx
        subprocess.run(["npx", "--yes", "create-react-app@latest", safe_name, "--template", "typescript"], cwd=base_dir, check=True)
        
        # Add some common dependencies
        subprocess.run(["npm", "install", "--save", "@mui/material", "@emotion/react", "@emotion/styled", "axios", "react-router-dom", "@types/react-router-dom"], cwd=project_dir, check=True)
        
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"React project creation failed: {e}")
    return project_dir

def generate_angular_project(project_name: str, base_dir: Path) -> Path:
    # npm project names must be lowercase and cannot contain spaces or capital letters
    safe_name = project_name.lower().replace(' ', '-')
    project_dir = base_dir / safe_name
    if project_dir.exists():
        shutil.rmtree(project_dir)
    try:
        # Create Angular project using Angular CLI, automatically select CSS for styles, and disable SSR/SSG
        subprocess.run([
            "npx", "--yes", "@angular/cli", "new", safe_name,
            "--skip-git", "--skip-install", "--strict", "--style=css", "--ssr=false"
        ], cwd=base_dir, check=True)
        # Install dependencies
        subprocess.run(["npm", "install"], cwd=project_dir, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Angular project creation failed: {e}")
    return project_dir

def generate_vue_project(project_name: str, base_dir: Path) -> Path:
    # npm project names must be lowercase and cannot contain spaces or capital letters
    safe_name = project_name.lower().replace(' ', '-')
    project_dir = base_dir / safe_name
    if project_dir.exists():
        shutil.rmtree(project_dir)
    try:
        # Create Vue project using Vue CLI
        subprocess.run([
            "npx", "--yes", "@vue/cli", "create", safe_name,
            "--default", "--no-git", "--merge"
        ], cwd=base_dir, check=True)
        
        # Add some common dependencies
        subprocess.run([
            "npm", "install", "--save",
            "vue-router@4", "pinia", "axios", "@vueuse/core"
        ], cwd=project_dir, check=True)
        
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Vue project creation failed: {e}")
    return project_dir

def setup_dotnet_database(project_path: Path, database_type: str) -> None:
    """Setup database for .NET project"""
    try:
        if database_type.lower() in {"sql server", "mssql", "sqlserver"}:
            # Add SQL Server packages
            subprocess.run(["dotnet", "add", "package", "Microsoft.EntityFrameworkCore.SqlServer"], cwd=project_path, check=True)
            subprocess.run(["dotnet", "add", "package", "Microsoft.EntityFrameworkCore.Tools"], cwd=project_path, check=True)
        elif database_type.lower() in {"postgresql", "postgres"}:
            # Add PostgreSQL packages
            subprocess.run(["dotnet", "add", "package", "Npgsql.EntityFrameworkCore.PostgreSQL"], cwd=project_path, check=True)
            subprocess.run(["dotnet", "add", "package", "Microsoft.EntityFrameworkCore.Tools"], cwd=project_path, check=True)
        elif database_type.lower() in {"sqlite"}:
            # Add SQLite packages
            subprocess.run(["dotnet", "add", "package", "Microsoft.EntityFrameworkCore.Sqlite"], cwd=project_path, check=True)
            subprocess.run(["dotnet", "add", "package", "Microsoft.EntityFrameworkCore.Tools"], cwd=project_path, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to setup .NET database: {e}")

def setup_nodejs_database(project_path: Path, database_type: str) -> None:
    """Setup database for Node.js project"""
    try:
        if database_type.lower() in {"mongodb", "mongo"}:
            subprocess.run(["npm", "install", "mongoose"], cwd=project_path, check=True)
        elif database_type.lower() in {"postgresql", "postgres"}:
            subprocess.run(["npm", "install", "pg", "sequelize"], cwd=project_path, check=True)
        elif database_type.lower() in {"mysql"}:
            subprocess.run(["npm", "install", "mysql2", "sequelize"], cwd=project_path, check=True)
        elif database_type.lower() in {"sqlite"}:
            subprocess.run(["npm", "install", "sqlite3", "sequelize"], cwd=project_path, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to setup Node.js database: {e}")

def setup_django_database(project_path: Path, database_type: str) -> None:
    """Setup database for Django project"""
    try:
        if database_type.lower() in {"postgresql", "postgres"}:
            subprocess.run([f"{project_path}/venv/bin/pip", "install", "psycopg2-binary"], cwd=project_path, check=True)
        elif database_type.lower() in {"mysql"}:
            subprocess.run([f"{project_path}/venv/bin/pip", "install", "mysqlclient"], cwd=project_path, check=True)
        elif database_type.lower() in {"mongodb", "mongo"}:
            subprocess.run([f"{project_path}/venv/bin/pip", "install", "djongo"], cwd=project_path, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to setup Django database: {e}")

def generate_gitlab_ci_yaml(tech_stack: TechStack) -> str:
    """Generate GitLab CI/CD YAML using LLM"""
    try:
        model = genai.GenerativeModel('gemini-2.5-pro-preview-05-06')
        
        prompt = f"""
        You are a CI/CD expert. Generate a complete .gitlab-ci.yml file for a project with the following tech stack:
        
        Backend: {tech_stack.backend or []}
        Frontend: {tech_stack.frontend or []}
        Database: {tech_stack.database or 'None'}
        Deployment: {tech_stack.deployment or 'None'}
        Additional Tools: {tech_stack.additional_tools or []}
        
        Requirements:
        1. Return ONLY the YAML content, no markdown formatting or code blocks
        2. Include stages for: test, build, deploy
        3. Handle both backend and frontend if both are present
        4. Include database setup if specified
        5. Use appropriate Docker images for each technology
        6. Include proper caching for dependencies
        7. Add environment variables for database connections if needed
        8. Make it production-ready with proper security practices
        
        Return the complete .gitlab-ci.yml content:
        """
        
        response = model.generate_content(prompt)
        
        # Clean the response - remove any markdown formatting
        yaml_content = response.text.strip()
        yaml_content = re.sub(r'```yaml\s*', '', yaml_content)
        yaml_content = re.sub(r'```\s*$', '', yaml_content)
        
        return yaml_content
        
    except Exception as e:
        print(f"Error generating GitLab CI YAML: {str(e)}")
        # Return a basic fallback YAML
        return """stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"
  PYTHON_VERSION: "3.10"

test:
  stage: test
  script:
    - echo "Running tests..."
  only:
    - main
    - merge_requests

build:
  stage: build
  script:
    - echo "Building project..."
  only:
    - main

deploy:
  stage: deploy
  script:
    - echo "Deploying project..."
  only:
    - main
"""

@app.get("/")
async def root():
    return {"message": "Welcome to Shipwright AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/ai/extract-tech-stack", response_model=TechStackResponse)
async def extract_tech_stack(request: TechStackRequest):
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-2.5-pro-preview-05-06')
        
        # Create the prompt for tech stack extraction
        prompt = f"""
        You are a tech stack analyzer. Your task is to analyze the project description and return ONLY a JSON object with the technology stack and the project name.
        Do not include any markdown formatting, code blocks, or explanations. Just return the raw JSON object.

        Required JSON structure:
        {{
            "name": "project name",
            "frontend": ["list", "of", "frontend", "technologies"],
            "backend": ["list", "of", "backend", "technologies"],
            "database": "database technology",
            "deployment": "deployment platform",
            "additional_tools": ["list", "of", "additional", "tools"]
        }}

        Project description: {request.prompt}
        Additional context: {request.additional_context if request.additional_context else 'None'}
        """
        
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        # Print raw response for debugging
        print("Raw response:", response.text)
        
        # Clean the response text
        cleaned_text = response.text
        # Remove markdown code block markers if present
        cleaned_text = re.sub(r'```json\s*', '', cleaned_text)
        cleaned_text = re.sub(r'```\s*$', '', cleaned_text)
        # Remove any leading/trailing whitespace
        cleaned_text = cleaned_text.strip()
        
        try:
            # Try to parse the cleaned response as JSON
            tech_stack_data = json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            # If JSON parsing fails, try to extract JSON from the text
            json_match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
            if json_match:
                tech_stack_data = json.loads(json_match.group())
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to parse AI response as JSON. Raw response: {response.text}"
                )
        
        # Create TechStack object from the response
        tech_stack = TechStack(
            name=tech_stack_data.get("name"),
            frontend=tech_stack_data.get("frontend", []),
            backend=tech_stack_data.get("backend", []),
            database=tech_stack_data.get("database"),
            deployment=tech_stack_data.get("deployment"),
            additional_tools=tech_stack_data.get("additional_tools", [])
        )
        
        return TechStackResponse(
            tech_stack=tech_stack,
            confidence=0.95,
            metadata={
                "model": "gemini-2.5-pro-preview-05-06",
                "prompt_tokens": len(prompt.split()),
                "response_tokens": len(response.text.split()),
                "raw_response": response.text,
                "cleaned_response": cleaned_text
            }
        )
    except Exception as e:
        print(f"Error: {str(e)}")  # Print error for debugging
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/project/generate_backend", response_model=GenerateProjectResponse)
async def generate_backend_project(request: GenerateProjectRequest):
    # Use the name from tech_stack if available, otherwise use the request name
    project_name = request.tech_stack.name or request.name
    # Create Projects directory at the root level
    root_dir = Path(__file__).resolve().parent.parent
    projects_dir = root_dir / "Projects"
    backend_dir = projects_dir / "backend"
    backend_dir.mkdir(parents=True, exist_ok=True)
    
    project_path = backend_dir / project_name

    try:
        # Check which heavyweight stack to use
        all_techs = set((request.tech_stack.frontend or []) + (request.tech_stack.backend or []) + 
                      [request.tech_stack.database or "", request.tech_stack.deployment or ""])
        
        if any(tech.lower() in {".net"} for tech in all_techs):
            generated_path = generate_dotnet_project(project_name, backend_dir)
            if request.tech_stack.database:
                setup_dotnet_database(generated_path, request.tech_stack.database)
            return GenerateProjectResponse(
                type="cli",
                project_path=str(generated_path),
                message=f"Backend created using .NET CLI with {request.tech_stack.database or 'no'} database"
            )
        elif any(tech.lower() in {"node.js", "nodejs"} for tech in all_techs):
            generated_path = generate_nodejs_project(project_name, backend_dir)
            if request.tech_stack.database:
                setup_nodejs_database(generated_path, request.tech_stack.database)
            return GenerateProjectResponse(
                type="cli",
                project_path=str(generated_path),
                message=f"Backend created using Node.js CLI with {request.tech_stack.database or 'no'} database"
            )
        elif any(tech.lower() in {"django"} for tech in all_techs):
            generated_path = generate_django_project(project_name, backend_dir)
            if request.tech_stack.database:
                setup_django_database(generated_path, request.tech_stack.database)
            return GenerateProjectResponse(
                type="cli",
                project_path=str(generated_path),
                message=f"Backend created using Django CLI with {request.tech_stack.database or 'no'} database"
            )
        else:
            raise HTTPException(
                status_code=400, 
                detail="Only .NET, Node.js, and Django backends are supported. Please specify one of these technologies in your tech stack."
            )

    except Exception as e:
        if project_path.exists():
            shutil.rmtree(project_path, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/project/generate_frontend", response_model=GenerateFrontendResponse)
async def generate_frontend_project(request: GenerateFrontendRequest):
    # Use the name from tech_stack if available, otherwise use the request name
    project_name = request.tech_stack.name or request.name
    
    # Create Projects directory at the root level
    root_dir = Path(__file__).resolve().parent.parent
    projects_dir = root_dir / "Projects"
    frontend_dir = projects_dir / "frontend"
    frontend_dir.mkdir(parents=True, exist_ok=True)
    
    # npm project names must be lowercase and cannot contain spaces or capital letters
    safe_name = project_name.lower().replace(' ', '-')
    project_path = frontend_dir / safe_name

    try:
        frontend_stack = [tech.lower() for tech in (request.tech_stack.frontend or [])]
        if "react" in frontend_stack:
            generated_path = generate_react_project(project_name, frontend_dir)
            return GenerateFrontendResponse(
                type="cli",
                project_path=str(generated_path),
                message="Frontend created using create-react-app"
            )
        elif "angular" in frontend_stack:
            generated_path = generate_angular_project(project_name, frontend_dir)
            return GenerateFrontendResponse(
                type="cli",
                project_path=str(generated_path),
                message="Frontend created using Angular CLI"
            )
        elif "vue" in frontend_stack:
            generated_path = generate_vue_project(project_name, frontend_dir)
            return GenerateFrontendResponse(
                type="cli",
                project_path=str(generated_path),
                message="Frontend created using Vue CLI"
            )
        else:
            # AI-generated frontend
            model = genai.GenerativeModel('gemini-2.5-pro-preview-05-06')
            ai_prompt = f"""
            You are a code generator. Based on this stack: {request.tech_stack.dict()} — create a minimal working frontend project.
            Only return a JSON list of files like this:
            [
                {{"path": "index.html", "content": "<!DOCTYPE html>..."}},
                {{"path": "styles.css", "content": "body {{ margin: 0; }}"}}
            ]
            """
            response = model.generate_content(ai_prompt)
            files = json.loads(response.text.strip())

            if project_path.exists():
                shutil.rmtree(project_path)
            project_path.mkdir(parents=True, exist_ok=True)

            for file in files:
                file_path = project_path / file["path"]
                file_path.parent.mkdir(parents=True, exist_ok=True)
                file_path.write_text(file["content"])

            return GenerateFrontendResponse(
                type="ai",
                project_path=str(project_path),
                message="Frontend created using AI"
            )

    except Exception as e:
        if project_path.exists():
            shutil.rmtree(project_path, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/project/generate_cicd")
async def generate_cicd_pipeline(tech_stack: TechStack):
    """Generate GitLab CI/CD pipeline YAML for the given tech stack"""
    try:
        yaml_content = generate_gitlab_ci_yaml(tech_stack)
        return {"cicd_yaml": yaml_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate CI/CD pipeline: {str(e)}")

@app.post("/api/project/generate_full", response_model=GenerateFullProjectResponse)
async def generate_full_project(request: GenerateFullProjectRequest = Body(...)):
    backend_result = None
    frontend_result = None
    cicd_yaml = None
    has_backend = bool(request.tech_stack.backend)
    has_frontend = bool(request.tech_stack.frontend)
    messages = []

    # Create Projects directory at the root level
    root_dir = Path(__file__).resolve().parent.parent
    projects_dir = root_dir / "Projects"
    projects_dir.mkdir(parents=True, exist_ok=True)

    if has_backend:
        backend_result = await generate_backend_project(GenerateProjectRequest(
            name=request.name,
            tech_stack=request.tech_stack
        ))
        messages.append(f"Backend: {backend_result.message}")
    if has_frontend:
        frontend_result = await generate_frontend_project(GenerateFrontendRequest(
            name=request.name,
            tech_stack=request.tech_stack
        ))
        messages.append(f"Frontend: {frontend_result.message}")
    if not has_backend and not has_frontend:
        messages.append("No backend or frontend specified in tech stack.")

    # Generate CI/CD pipeline
    try:
        cicd_yaml = generate_gitlab_ci_yaml(request.tech_stack)
        messages.append("CI/CD: GitLab pipeline generated")
        
        # Save the .gitlab-ci.yml file at the project root
        project_name = request.tech_stack.name or request.name
        cicd_file_path = projects_dir / ".gitlab-ci.yml"
        with open(cicd_file_path, "w") as f:
            f.write(cicd_yaml)
            
    except Exception as e:
        messages.append(f"CI/CD: Failed to generate pipeline - {str(e)}")

    return GenerateFullProjectResponse(
        backend=backend_result,
        frontend=frontend_result,
        cicd=cicd_yaml,
        message=" | ".join(messages)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 