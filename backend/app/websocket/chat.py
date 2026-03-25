# websocket/chat.py
from fastapi import WebSocket, APIRouter

router=APIRouter()
clients=[]

@router.websocket("/ws")
async def ws(ws:WebSocket):
    await ws.accept()
    clients.append(ws)
    try:
        while True:
            msg=await ws.receive_text()
            for c in clients:
                await c.send_text(msg)
    except:
        clients.remove(ws)