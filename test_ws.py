import asyncio
import websockets

async def test_ws():
    uri = "wss://prisme-backend-nduw.onrender.com/ws"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")
            await websocket.send('{"mode": "live"}')
            response = await websocket.recv()
            print("Received data:", response[:100])
    except Exception as e:
        print("Failed to connect:", e)

asyncio.run(test_ws())
