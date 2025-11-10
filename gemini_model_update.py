#!/usr/bin/env python3
"""
HAZoom Model Configuration Updater
This script prepares the changes needed to update the model configuration
"""

import os
import re
from pathlib import Path

def find_and_replace_model(project_root="/d/project", old_model="minimax-m2:cloud", new_model="glm-4.6:cloud"):
    """Find and replace model configurations in the project"""
    project_path = Path(project_root)
    updated_files = []
    
    # Patterns to find model configurations
    patterns = [
        (rf"ollama_model\s*=\s*['\"]{re.escape(old_model)}['\"]", f"ollama_model = '{new_model}'"),
        (rf"['\"]{re.escape(old_model)}['\"]", f"'{new_model}'"),
        (rf"current_model['\"]?\s*:\s*['\"]{re.escape(old_model)}['\"]", f"current_model: '{new_model}'"),
    ]
    
    print(f"🔍 Searching for '{old_model}' to replace with '{new_model}'...")
    
    for file_path in project_path.rglob("*"):
        # Skip certain directories and file types
        if any(skip in str(file_path) for skip in ['__pycache__', '.git', 'node_modules']):
            continue
            
        # Only process text files
        if file_path.suffix not in ['.py', '.js', '.jsx', '.md', '.json', '.html', '.css']:
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            updated = False
            
            # Apply replacements
            for pattern, replacement in patterns:
                if re.search(pattern, content, re.IGNORECASE):
                    content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
                    updated = True
            
            if updated:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_files.append(str(file_path))
                print(f"✅ Updated: {file_path}")
                
        except Exception as e:
            # Skip files that can't be read as text
            continue
    
    return updated_files

def verify_changes(project_root="/d/project", old_model="minimax-m2:cloud", new_model="glm-4.6:cloud"):
    """Verify that changes were applied correctly"""
    project_path = Path(project_root)
    old_references = []
    new_references = []
    
    print(f"\n🔍 Verifying changes...")
    
    for file_path in project_path.rglob("*"):
        if any(skip in str(file_path) for skip in ['__pycache__', '.git', 'node_modules']):
            continue
            
        if file_path.suffix not in ['.py', '.js', '.jsx', '.md', '.json', '.html', '.css']:
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
    
    print(f"📊 Results:")
    print(f"  Files with old model '{old_model}': {len(old_references)}")
    for ref in old_references:
        print(f"    - {ref}")
    
    print(f"  Files with new model '{new_model}': {len(new_references)}")
    for ref in new_references[:10]:  # Show first 10
        print(f"    - {ref}")
    if len(new_references) > 10:
        print(f"    ... and {len(new_references) - 10} more")
    
    return len(old_references) == 0

def create_gemini_prompt(old_model="minimax-m2:cloud", new_model="glm-4.6:cloud"):
    """Create a prompt for Gemini to review the changes"""
    return f"""
Please review this model configuration update for the HAZoom quantum AI system:

OLD MODEL: {old_model}
NEW MODEL: {new_model}

Context: This is a Django + React application with an AI chat backend using Ollama for local LLM inference.

Key files that typically need updates:
1. Backend Python files (llm_backend.py, api_views.py)
2. Frontend JavaScript/React components
3. Documentation and examples
4. Configuration files

Please verify that:
1. All references to the old model are replaced
2. The new model name is correctly formatted
3. No functionality is broken
4. Documentation is updated consistently

The system should now use {new_model} as the default goose session model.
"""

def main():
    """Main function to perform the model update"""
    print("🤖 HAZoom Model Configuration Updater")
    print("=" * 50)
    
    # Default values
    old_model = "minimax-m2:cloud"
    new_model = "glm-4.6:cloud"
    
    # Allow user to specify different models
    import sys
    if len(sys.argv) > 1:
        old_model = sys.argv[1]
    if len(sys.argv) > 2:
        new_model = sys.argv[2]
    
    print(f"🔄 Replacing '{old_model}' with '{new_model}'")
    print()
    
    # Perform the replacement
    updated_files = find_and_replace_model(old_model, new_model)
    
    print(f"\n✨ Update Summary:")
    print(f"  Files updated: {len(updated_files)}")
    
    # Verify changes
    success = verify_changes(old_model, new_model)
    
    if success:
        print(f"\n🎉 Success! All references to '{old_model}' have been replaced with '{new_model}'")
    else:
        print(f"\n⚠️  Some references to '{old_model}' may still exist")
    
    # Create Gemini prompt for review
    gemini_prompt = create_gemini_prompt(old_model, new_model)
    
    print(f"\n📝 Gemini Review Prompt:")
    print("-" * 30)
    print(gemini_prompt)
    print("-" * 30)
    
    print(f"\n🚀 You can now:")
    print(f"1. Test the application with: python manage.py runserver")
    print(f"2. Check Ollama models with: ollama list")
    print(f"3. Use the prompt above with Gemini for additional review")

if __name__ == "__main__":
    main()