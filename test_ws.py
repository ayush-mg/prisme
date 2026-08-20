import asyncio
import websockets
async def test():
    async with websockets.connect('ws://127.0.0.1:8000/ws') as ws:
        msg = await ws.recv()
        print("RECEIVED FROM BACKEND:", msg)
asyncio.run(test())
