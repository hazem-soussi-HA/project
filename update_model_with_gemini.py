#!/usr/bin/env python3
"""
Update HAZoom model configuration using Gemini AI
This script uses Google's Gemini to intelligently update model configurations
"""

import os
import sys
import json
import re
from pathlib import Path

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Gemini not available. Install with: pip install google-generativeai")
    sys.exit(1)

class GeminiModelUpdater:
    def __init__(self, api_key=None):
        """Initialize Gemini with API key"""
        if not api_key:
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                print("Error: GEMINI_API_KEY environment variable not set")
                sys.exit(1)
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        
    def find_model_configurations(self, project_root="/d/project"):
        """Find all files that contain model configurations"""
        project_path = Path(project_root)
        model_files = []
        
        # Common patterns for model configuration
        patterns = [
            r"ollama_model\s*=\s*['\"][^'\"]+['\"]",
            r"default.*model.*=.*['\"][^'\"]+['\"]",
            r"model.*=.*['\"][^'\"]+['\"]",
            r"current_model['\"]?\s*:\s*['\"][^'\"]+['\"]",
            r"minimax-m2:cloud",
            r"qwen2\.5:latest"
        ]
        
        for file_path in project_path.rglob("*.py"):
            if '__pycache__' in str(file_path):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                for pattern in patterns:
                    if re.search(pattern, content, re.IGNORECASE):
                        model_files.append(str(file_path))
                        break
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
        
        return model_files
    
    def update_model_in_file(self, file_path, old_model, new_model):
        """Update model references in a specific file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Use Gemini to intelligently update the file
            prompt = f"""
            Please update this Python/JavaScript/JSON file to replace the old model '{old_model}' with the new model '{new_model}'.
            
            File content:
            ```
            {content}
            ```
            
            Rules:
            1. Replace all occurrences of '{old_model}' with '{new_model}'
            2. Preserve all formatting, comments, and code structure
            3. Only change model names, don't modify any other logic
            4. Return the complete updated file content
            5. If no changes are needed, return the original content unchanged
            
            Return only the updated file content, no explanations.
            """
            
            response = self.model.generate_content(prompt)
            updated_content = response.text
            
            # Write back the updated content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            
            print(f"✅ Updated: {file_path}")
            return True
            
        except Exception as e:
            print(f"❌ Error updating {file_path}: {e}")
            return False
    
    def update_all_models(self, old_model="minimax-m2:cloud", new_model="glm-4.6:cloud"):
        """Update all model configurations in the project"""
        print(f"🔍 Searching for model configurations...")
        print(f"🔄 Replacing '{old_model}' with '{new_model}'")
        
        model_files = self.find_model_configurations()
        
        if not model_files:
            print("No model configuration files found")
            return
        
        print(f"Found {len(model_files)} files to check:")
        for file_path in model_files:
            print(f"  - {file_path}")
        
        print("\n🚀 Starting updates...")
        updated_count = 0
        
        for file_path in model_files:
            if self.update_model_in_file(file_path, old_model, new_model):
                updated_count += 1
        
        print(f"\n✨ Update complete! Updated {updated_count} files.")
        
        # Verify the changes
        print("\n🔍 Verifying updates...")
        self.verify_updates(old_model, new_model)
    
    def verify_updates(self, old_model, new_model):
        """Verify that the old model has been replaced"""
        project_path = Path("/d/project")
        old_references = []
        new_references = []
        
        for file_path in project_path.rglob("*.py"):
            if '__pycache__' in str(file_path):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                if old_model in content:
                    old_references.append(str(file_path))
                if new_model in content:
                    new_references.append(str(file_path))
            except Exception:
                continue
        
        if old_references:
            print(f"⚠️  Found remaining references to old model '{old_model}':")
            for ref in old_references:
                print(f"  - {ref}")
        else:
            print(f"✅ No remaining references to old model '{old_model}'")
        
        print(f"✅ New model '{new_model}' found in {len(new_references)} files")

def main():
    """Main function to run the model updater"""
    print("🤖 HAZoom Gemini Model Updater")
    print("=" * 40)
    
    # Check for API key
    if not os.getenv('GEMINI_API_KEY'):
        print("❌ Error: GEMINI_API_KEY environment variable not set")
        print("Set it with: export GEMINI_API_KEY='your-api-key-here'")
        sys.exit(1)
    
    # Initialize updater
    updater = GeminiModelUpdater()
    
    # Get user input for models
    old_model = input("Enter old model name (default: minimax-m2:cloud): ").strip()
    if not old_model:
        old_model = "minimax-m2:cloud"
    
    new_model = input("Enter new model name (default: glm-4.6:cloud): ").strip()
    if not new_model:
        new_model = "glm-4.6:cloud"
    
    # Confirm update
    print(f"\n🔄 Ready to replace '{old_model}' with '{new_model}'")
    confirm = input("Continue? (y/N): ").strip().lower()
    
    if confirm in ['y', 'yes']:
        updater.update_all_models(old_model, new_model)
    else:
        print("Update cancelled.")

if __name__ == "__main__":
    main()