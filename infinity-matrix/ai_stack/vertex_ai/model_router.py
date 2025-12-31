#!/usr/bin/env python3
# Model Router - Intelligent routing for Vertex AI

from enum import Enum

class TaskType(Enum):
    CODE = 'code'
    CHAT = 'chat'
    IMAGE = 'image'
    RESEARCH = 'research'
    GENERAL = 'general'

class ModelRouter:
    """Routes requests to best Vertex AI model"""
    
    def __init__(self, manager):
        self.manager = manager
        self.routing_rules = {
            'code': ['code', 'function', 'class', 'implement'],
            'chat': ['chat', 'talk', 'discuss'],
            'image': ['image', 'picture', 'photo'],
            'research': ['research', 'analyze', 'complex'],
        }
    
    def detect_task(self, prompt):
        """Detect task type from prompt"""
        prompt_lower = prompt.lower()
        
        for task, keywords in self.routing_rules.items():
            if any(kw in prompt_lower for kw in keywords):
                return task
        return 'general'
    
    def route(self, prompt):
        """Route prompt to best model"""
        task = self.detect_task(prompt)
        model = self.manager.select_model(task)
        return {
            'task_type': task,
            'selected_model': model,
            'reason': f'Best model for {task} tasks'
        }

if __name__ == '__main__':
    from vertex_manager import VertexAIManager
    mgr = VertexAIManager()
    router = ModelRouter(mgr)
    result = router.route('Write a Python function')
    print(result)
