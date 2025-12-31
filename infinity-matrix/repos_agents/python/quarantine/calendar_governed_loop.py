from integrations.google.calendar_controller import CalendarController
from integrations.google.tasks_controller import TaskController
from governance.engine import GovernanceEngine

class CalendarGovernedLoop:
    def __init__(self):
        self.calendar = CalendarController()
        self.tasks = TaskController()
        self.gov = GovernanceEngine()

    def run_cycle(self):
        events = self.calendar.get_today_events()
        tasks = self.tasks.list_tasks()

        for task in tasks:
            action = task.get('title','')
            if self.gov.authorize(action):
                print(f'[EXECUTING] {action}')
                self.tasks.complete_task(task['id'])
                self.calendar.log_execution(f'Completed: {action}')
            else:
                print(f'[DENIED] {action}')
