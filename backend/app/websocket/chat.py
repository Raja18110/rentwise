from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from typing import Set
import json
from datetime import datetime

router = APIRouter()

# Store connected users with their websocket connections
clients: Set[WebSocket] = set()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        """Accept a new websocket connection"""
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"✅ Client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Remove a disconnected websocket"""
        self.active_connections.discard(websocket)
        print(f"❌ Client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, data: dict):
        """Broadcast message to all connected clients"""
        if not self.active_connections:
            return

        # Add timestamp
        data["timestamp"] = datetime.now().isoformat()

        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception as e:
                # If sending fails, mark for disconnection
                print(f"Error sending message: {e}")
                disconnected.add(connection)

        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

    async def send_error(self, websocket: WebSocket, message: str):
        """Send error message to specific client"""
        try:
            await websocket.send_json({
                "type": "error",
                "message": message,
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            print(f"Error sending error message: {e}")


manager = ConnectionManager()


@router.websocket("/wss")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time chat
    
    Message format:
    {
        "type": "message" | "user_info",
        "content": "message text",
        "user": "username" (optional)
    }
    """
    try:
        await manager.connect(websocket)

        while True:
            # Receive data from client with timeout
            try:
                data = await websocket.receive_text()

                # Parse and validate message
                if not data or not isinstance(data, str):
                    await manager.send_error(websocket, "Invalid message format")
                    continue

                # Try to parse as JSON
                try:
                    message_data = json.loads(data)
                except json.JSONDecodeError:
                    # If not JSON, treat as plain text message
                    message_data = {
                        "type": "message",
                        "content": data
                    }

                # Validate message has content
                if not message_data.get("content"):
                    await manager.send_error(websocket, "Message content is empty")
                    continue

                # Sanitize message length
                content = str(message_data.get("content", ""))[:1000]
                if not content.strip():
                    continue

                # Broadcast to all connected clients
                await manager.broadcast({
                    "type": message_data.get("type", "message"),
                    "content": content,
                    "user": message_data.get("user", "Anonymous")
                })

            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Error receiving message: {e}")
                await manager.send_error(websocket, "Error processing message")

    except Exception as e:
        print(f"WebSocket error: {e}")

    finally:
        manager.disconnect(websocket)
        
        # Notify other clients about disconnection
        try:
            await manager.broadcast({
                "type": "user_left",
                "message": "A user has disconnected",
                "active_connections": len(manager.active_connections)
            })
        except Exception as e:
            print(f"Error broadcasting disconnect: {e}")
