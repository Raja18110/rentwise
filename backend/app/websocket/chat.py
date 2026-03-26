from fastapi import APIRouter, WebSocket

router = APIRouter()

# Store connected users
clients = []


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)

    try:
        while True:
            data = await websocket.receive_text()

            # Broadcast message to all connected clients
            for client in clients:
                await client.send_text(data)

    except:
        clients.remove(websocket)