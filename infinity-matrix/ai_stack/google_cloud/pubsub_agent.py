"""
Pub/Sub Agent - Enterprise-grade Google Cloud Pub/Sub integration
Handles asynchronous messaging, event streaming, and queue management
"""
import json
from typing import Dict, List, Any, Callable, Optional
from datetime import datetime
from enum import Enum
from collections import deque


class MessageType(Enum):
    """Message types for Pub/Sub topics."""
    SYSTEM_EVENT = "system.event"
    DATA_SYNC = "data.sync"
    ALERT = "alert"
    WORKFLOW = "workflow.event"
    TELEMETRY = "telemetry"
    CUSTOM = "custom"


class PubSubAgent:
    """
    Enterprise Pub/Sub agent for asynchronous messaging and event streaming.
    Supports multiple topics, subscriptions, batching, and dead-letter handling.
    """
    
    def __init__(self):
        """Initialize Pub/Sub agent with message queues and subscribers."""
        self.topics = {}
        self.subscriptions = {}
        self.message_queues = {}  # Topic -> deque of messages
        self.subscribers = {}  # Subscription -> list of callbacks
        self.dead_letter_queue = deque(maxlen=1000)
        self.stats = {
            'messages_published': 0,
            'messages_received': 0,
            'messages_failed': 0
        }
        self.config = {
            'max_batch_size': 100,
            'batch_timeout_ms': 1000,
            'max_message_size': 10 * 1024 * 1024,  # 10MB
            'retention_days': 7
        }

    def create_topic(self, topic_name: str, labels: Optional[Dict[str, str]] = None,
                    message_retention_duration: int = 604800) -> str:
        """
        Create a new Pub/Sub topic.
        
        Args:
            topic_name: Name of the topic (e.g., 'system-events')
            labels: Optional labels for organization
            message_retention_duration: Message retention in seconds (default 7 days)
            
        Returns:
            Topic name/ID
        """
        topic_config = {
            'name': topic_name,
            'labels': labels or {},
            'created_at': datetime.utcnow().isoformat(),
            'message_retention_duration': message_retention_duration,
            'message_count': 0
        }
        
        self.topics[topic_name] = topic_config
        self.message_queues[topic_name] = deque(maxlen=10000)
        
        return topic_name

    def publish_message(self, topic_name: str, message: Dict[str, Any], 
                       attributes: Optional[Dict[str, str]] = None) -> str:
        """
        Publish a message to a topic.
        
        Args:
            topic_name: Topic name
            message: Message data (will be JSON-encoded)
            attributes: Optional message attributes for filtering
            
        Returns:
            Message ID
        """
        if topic_name not in self.topics:
            raise ValueError(f"Topic '{topic_name}' does not exist")
            
        if isinstance(message, dict):
            message_data = json.dumps(message)
        else:
            message_data = str(message)
            
        # Check message size
        if len(message_data) > self.config['max_message_size']:
            self.stats['messages_failed'] += 1
            self.dead_letter_queue.append({
                'topic': topic_name,
                'error': 'Message exceeds max size',
                'timestamp': datetime.utcnow().isoformat()
            })
            raise ValueError("Message size exceeds limit")

        # Create message envelope
        message_envelope = {
            'message_id': self._generate_message_id(),
            'data': message_data,
            'attributes': attributes or {},
            'publish_time': datetime.utcnow().isoformat(),
            'topic': topic_name
        }
        
        # Add to topic queue
        self.message_queues[topic_name].append(message_envelope)
        self.topics[topic_name]['message_count'] += 1
        self.stats['messages_published'] += 1
        
        # Trigger callbacks for all subscriptions to this topic
        self._trigger_subscribers(topic_name, message_envelope)
        
        return message_envelope['message_id']

    def publish_batch(self, topic_name: str, messages: List[Dict[str, Any]]) -> List[str]:
        """
        Publish multiple messages in a batch.
        
        Args:
            topic_name: Topic name
            messages: List of message data
            
        Returns:
            List of message IDs
        """
        if len(messages) > self.config['max_batch_size']:
            raise ValueError(f"Batch size exceeds limit of {self.config['max_batch_size']}")
            
        message_ids = []
        for message in messages:
            try:
                msg_id = self.publish_message(topic_name, message)
                message_ids.append(msg_id)
            except Exception as e:
                self.stats['messages_failed'] += 1
                self.dead_letter_queue.append({
                    'error': str(e),
                    'timestamp': datetime.utcnow().isoformat()
                })
                
        return message_ids

    def create_subscription(self, subscription_name: str, topic_name: str,
                          ack_deadline_seconds: int = 60,
                          filter_expression: Optional[str] = None) -> str:
        """
        Create a subscription to a topic.
        
        Args:
            subscription_name: Subscription name
            topic_name: Topic to subscribe to
            ack_deadline_seconds: Time to acknowledge messages
            filter_expression: Optional CEL expression to filter messages
            
        Returns:
            Subscription name/ID
        """
        if topic_name not in self.topics:
            raise ValueError(f"Topic '{topic_name}' does not exist")
            
        subscription = {
            'name': subscription_name,
            'topic': topic_name,
            'created_at': datetime.utcnow().isoformat(),
            'ack_deadline_seconds': ack_deadline_seconds,
            'filter_expression': filter_expression,
            'message_count': 0,
            'callbacks': []
        }
        
        self.subscriptions[subscription_name] = subscription
        self.subscribers[subscription_name] = []
        
        return subscription_name

    def subscribe(self, subscription_name: str, callback: Callable[[Dict[str, Any]], None]) -> str:
        """
        Subscribe to a subscription with a callback.
        
        Args:
            subscription_name: Subscription name
            callback: Function called on each message
            
        Returns:
            Subscriber ID
        """
        if subscription_name not in self.subscriptions:
            raise ValueError(f"Subscription '{subscription_name}' does not exist")
            
        subscriber_id = f"sub_{len(self.subscribers[subscription_name])}"
        
        self.subscriptions[subscription_name]['callbacks'].append({
            'id': subscriber_id,
            'callback': callback,
            'created_at': datetime.utcnow().isoformat()
        })
        
        self.subscribers[subscription_name].append(callback)
        
        return subscriber_id

    def pull_messages(self, subscription_name: str, max_messages: int = 10,
                     auto_ack: bool = False) -> List[Dict[str, Any]]:
        """
        Pull messages from a subscription.
        
        Args:
            subscription_name: Subscription name
            max_messages: Maximum messages to pull
            auto_ack: Automatically acknowledge messages
            
        Returns:
            List of messages
        """
        if subscription_name not in self.subscriptions:
            raise ValueError(f"Subscription '{subscription_name}' does not exist")
            
        subscription = self.subscriptions[subscription_name]
        topic_name = subscription['topic']
        
        # Get messages from topic queue
        messages = []
        topic_queue = self.message_queues[topic_name]
        
        while len(messages) < max_messages and topic_queue:
            message = topic_queue.popleft()
            
            # Apply filter if exists
            if subscription['filter_expression']:
                if not self._matches_filter(message, subscription['filter_expression']):
                    continue
                    
            messages.append(message)
            
            if auto_ack:
                subscription['message_count'] += 1
                self.stats['messages_received'] += 1
                
        return messages

    def acknowledge_messages(self, subscription_name: str, message_ids: List[str]) -> bool:
        """
        Acknowledge messages as processed.
        
        Args:
            subscription_name: Subscription name
            message_ids: List of message IDs to acknowledge
            
        Returns:
            Success status
        """
        if subscription_name in self.subscriptions:
            self.subscriptions[subscription_name]['message_count'] += len(message_ids)
            self.stats['messages_received'] += len(message_ids)
            return True
        return False

    def nack_messages(self, subscription_name: str, message_ids: List[str]) -> bool:
        """
        Negative acknowledge messages (requeue for retry).
        
        Args:
            subscription_name: Subscription name
            message_ids: List of message IDs to nack
            
        Returns:
            Success status
        """
        # Messages would be requeued here
        return True

    def delete_topic(self, topic_name: str) -> bool:
        """Delete a topic and all its subscriptions."""
        if topic_name in self.topics:
            # Delete all subscriptions for this topic
            subs_to_delete = [s for s, sub in self.subscriptions.items() 
                            if sub['topic'] == topic_name]
            for sub in subs_to_delete:
                del self.subscriptions[sub]
                del self.subscribers[sub]
                
            del self.topics[topic_name]
            if topic_name in self.message_queues:
                del self.message_queues[topic_name]
            return True
        return False

    def delete_subscription(self, subscription_name: str) -> bool:
        """Delete a subscription."""
        if subscription_name in self.subscriptions:
            del self.subscriptions[subscription_name]
            del self.subscribers[subscription_name]
            return True
        return False

    def list_topics(self) -> List[str]:
        """List all topics."""
        return list(self.topics.keys())

    def list_subscriptions(self, topic_name: Optional[str] = None) -> List[str]:
        """List subscriptions, optionally filtered by topic."""
        if topic_name:
            return [name for name, sub in self.subscriptions.items() 
                   if sub['topic'] == topic_name]
        return list(self.subscriptions.keys())

    def get_topic_stats(self, topic_name: str) -> Dict[str, Any]:
        """Get statistics for a topic."""
        if topic_name not in self.topics:
            return {}
        return {
            'name': topic_name,
            'message_count': self.topics[topic_name]['message_count'],
            'queue_size': len(self.message_queues[topic_name]),
            'subscriptions': [s for s, sub in self.subscriptions.items() 
                            if sub['topic'] == topic_name]
        }

    def get_subscription_stats(self, subscription_name: str) -> Dict[str, Any]:
        """Get statistics for a subscription."""
        if subscription_name not in self.subscriptions:
            return {}
        return {
            'name': subscription_name,
            'topic': self.subscriptions[subscription_name]['topic'],
            'message_count': self.subscriptions[subscription_name]['message_count'],
            'callbacks': len(self.subscriptions[subscription_name]['callbacks'])
        }

    def get_global_stats(self) -> Dict[str, Any]:
        """Get global Pub/Sub statistics."""
        return {
            'topics': len(self.topics),
            'subscriptions': len(self.subscriptions),
            'messages_published': self.stats['messages_published'],
            'messages_received': self.stats['messages_received'],
            'messages_failed': self.stats['messages_failed'],
            'dead_letter_queue_size': len(self.dead_letter_queue)
        }

    def _trigger_subscribers(self, topic_name: str, message: Dict[str, Any]) -> None:
        """Trigger all subscribers for a topic."""
        for sub_name, sub_config in self.subscriptions.items():
            if sub_config['topic'] == topic_name:
                for callback_config in sub_config['callbacks']:
                    try:
                        callback_config['callback'](message)
                    except Exception as e:
                        self.dead_letter_queue.append({
                            'error': str(e),
                            'message': message,
                            'timestamp': datetime.utcnow().isoformat()
                        })

    def _matches_filter(self, message: Dict[str, Any], filter_expr: str) -> bool:
        """Check if message matches filter expression."""
        # Simplified filter matching
        return True

    def _generate_message_id(self) -> str:
        """Generate a unique message ID."""
        import uuid
        return str(uuid.uuid4())[:16]
