export class TaskQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing: boolean = false;

  /**
   * Add a task to the queue
   */
  add(task: () => Promise<void>): void {
    this.queue.push(task);
    this.processQueue();
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          console.error('Task failed:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get queue length
   */
  get length(): number {
    return this.queue.length;
  }
}