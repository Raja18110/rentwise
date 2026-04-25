from datetime import datetime
import json
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.db import SessionLocal
from app.services.notification import create_notification


router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room: str):
        await websocket.accept()
        self.rooms.setdefault(room, set()).add(websocket)
        print(f"Client connected to {room}. Room clients: {len(self.rooms[room])}")

    def disconnect(self, websocket: WebSocket, room: str):
        room_clients = self.rooms.get(room)
        if not room_clients:
            return
        room_clients.discard(websocket)
        if not room_clients:
            self.rooms.pop(room, None)
        print(f"Client disconnected from {room}.")

    async def broadcast(self, room: str, data: dict):
        room_clients = self.rooms.get(room, set())
        if not room_clients:
            return

        data["timestamp"] = datetime.utcnow().isoformat()
        disconnected = set()

        for connection in room_clients:
            try:
                await connection.send_json(data)
            except Exception as e:
                print(f"Error sending message: {e}")
                disconnected.add(connection)

        for conn in disconnected:
            self.disconnect(conn, room)

    async def send_error(self, websocket: WebSocket, message: str):
        try:
            await websocket.send_json({
                "type": "error",
                "message": message,
                "timestamp": datetime.utcnow().isoformat(),
            })
        except Exception as e:
            print(f"Error sending error message: {e}")


manager = ConnectionManager()


@router.websocket("/wss")
async def websocket_endpoint(websocket: WebSocket):
    room = websocket.query_params.get("leaseId") or websocket.query_params.get("room") or "global"

    try:
        await manager.connect(websocket, room)

        while True:
            try:
                raw_data = await websocket.receive_text()
                if not raw_data:
                    await manager.send_error(websocket, "Invalid message format")
                    continue

                try:
                    message_data = json.loads(raw_data)
                except json.JSONDecodeError:
                    message_data = {"type": "message", "content": raw_data}

                content = str(message_data.get("content", ""))[:1000].strip()
                if not content:
                    await manager.send_error(websocket, "Message content is empty")
                    continue

                outgoing = {
                    "type": message_data.get("type", "message"),
                    "content": content,
                    "user": message_data.get("user", "Anonymous"),
                    "leaseId": message_data.get("leaseId") or room,
                }
                await manager.broadcast(room, outgoing)

                recipient_email = message_data.get("recipientEmail")
                if outgoing["type"] == "message" and recipient_email:
                    db = SessionLocal()
                    try:
                        create_notification(
                            db,
                            recipient_email,
                            f"{outgoing['user']} sent you a message.",
                            title="New chat message",
                            notification_type="message",
                        )
                    finally:
                        db.close()

            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Error receiving message: {e}")
                await manager.send_error(websocket, "Error processing message")

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket, room)
        try:
            await manager.broadcast(room, {
                "type": "user_left",
                "content": "A user has disconnected",
                "active_connections": len(manager.rooms.get(room, set())),
            })
        except Exception as e:
            print(f"Error broadcasting disconnect: {e}")
