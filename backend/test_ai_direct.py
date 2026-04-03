import asyncio
from app.services.selam_ai import handle_guest_message

async def test_ai():
    print("Testing AI...")
    try:
        response = await handle_guest_message("Tell me about Kuriftu Bishoftu", "Guest")
        print(f"RESPONSE: {response}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_ai())
