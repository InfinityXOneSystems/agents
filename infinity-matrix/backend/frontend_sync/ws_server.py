"""Backend WebSocket server for frontend sync."""
import asyncio
import websockets
import json

async def handler(websocket, path):
    async for message in websocket:
        data = json.loads(message)
        print(f"[WS] Frontend change event: {data}")
        # TODO: Ingest, index, and trigger backend/AI orchestration here

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("[WS] Backend WebSocket server running on ws://localhost:8765")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
