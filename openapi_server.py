#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.14"
# dependencies = [
#     "fastapi>=0.128.0",
#     "uvicorn>=0.40.0",
#     "pydantic>=2.0.0",
#     "typer",
# ]
# ///

"""FastAPI test server with diverse endpoints for OpenAPI agent testing."""

from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, status, Query, Path
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import typer

app = FastAPI(
    title="Test API Server",
    description="A test API server with various endpoints for OpenAPI agent experimentation",
    version="1.0.0",
    openapi_url="/openapi.json",
)

# CORS middleware for agent access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Data models
class User(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    age: Optional[int] = Field(None, ge=0, le=150)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    age: Optional[int] = Field(None, ge=0, le=150)


class Item(BaseModel):
    id: int
    name: str
    price: float
    category: str
    in_stock: bool = True


class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    price: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=50)
    in_stock: bool = True


class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    in_stock: Optional[bool] = None


class Order(BaseModel):
    id: int
    user_id: int
    items: List[dict]
    total: float
    status: str


class OrderCreate(BaseModel):
    user_id: int
    item_ids: List[int]


# In-memory data stores
users_db = [
    User(id=1, name="Alice Johnson", email="alice@example.com", age=28),
    User(id=2, name="Bob Smith", email="bob@example.com", age=34),
    User(id=3, name="Carol Davis", email="carol@example.com", age=22),
]

items_db = [
    Item(id=1, name="Laptop", price=999.99, category="Electronics", in_stock=True),
    Item(id=2, name="Coffee Mug", price=12.50, category="Kitchen", in_stock=True),
    Item(
        id=3, name="Book: Python Guide", price=29.99, category="Books", in_stock=False
    ),
    Item(
        id=4, name="Wireless Mouse", price=45.00, category="Electronics", in_stock=True
    ),
]

orders_db = []


# Health check endpoint
@app.get("/", tags=["health"])
async def root():
    return {"message": "Test API Server is running", "version": "1.0.0"}


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}


# User endpoints
@app.get("/users", response_model=List[User], tags=["users"])
async def get_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(
        10, ge=1, le=100, description="Maximum number of users to return"
    ),
    min_age: Optional[int] = Query(None, description="Minimum age filter"),
    max_age: Optional[int] = Query(None, description="Maximum age filter"),
):
    filtered_users = users_db
    if min_age is not None:
        filtered_users = [
            u for u in filtered_users if u.age is not None and u.age >= min_age
        ]
    if max_age is not None:
        filtered_users = [
            u for u in filtered_users if u.age is not None and u.age <= max_age
        ]

    return filtered_users[skip : skip + limit]


@app.get("/users/{user_id}", response_model=User, tags=["users"])
async def get_user(
    user_id: int = Path(..., gt=0, description="The ID of the user to retrieve"),
):
    user = next((u for u in users_db if u.id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post(
    "/users", response_model=User, status_code=status.HTTP_201_CREATED, tags=["users"]
)
async def create_user(user: UserCreate):
    new_id = max(u.id for u in users_db) + 1 if users_db else 1
    new_user = User(id=new_id, **user.dict())
    users_db.append(new_user)
    return new_user


@app.put("/users/{user_id}", response_model=User, tags=["users"])
async def update_user(
    user_update: UserUpdate,
    user_id: int = Path(..., gt=0, description="The ID of the user to update"),
):
    user = next((u for u in users_db if u.id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    return user


@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["users"])
async def delete_user(
    user_id: int = Path(..., gt=0, description="The ID of the user to delete"),
):
    user_index = next((i for i, u in enumerate(users_db) if u.id == user_id), None)
    if user_index is None:
        raise HTTPException(status_code=404, detail="User not found")

    users_db.pop(user_index)
    return None


# Item endpoints
@app.get("/items", response_model=List[Item], tags=["items"])
async def get_items(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(
        10, ge=1, le=100, description="Maximum number of items to return"
    ),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    in_stock: Optional[bool] = Query(None, description="Filter by stock status"),
):
    filtered_items = items_db
    if category:
        filtered_items = [
            i for i in filtered_items if i.category.lower() == category.lower()
        ]
    if min_price is not None:
        filtered_items = [i for i in filtered_items if i.price >= min_price]
    if max_price is not None:
        filtered_items = [i for i in filtered_items if i.price <= max_price]
    if in_stock is not None:
        filtered_items = [i for i in filtered_items if i.in_stock == in_stock]

    return filtered_items[skip : skip + limit]


@app.get("/items/{item_id}", response_model=Item, tags=["items"])
async def get_item(
    item_id: int = Path(..., gt=0, description="The ID of the item to retrieve"),
):
    item = next((i for i in items_db if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.post(
    "/items", response_model=Item, status_code=status.HTTP_201_CREATED, tags=["items"]
)
async def create_item(item: ItemCreate):
    new_id = max(i.id for i in items_db) + 1 if items_db else 1
    new_item = Item(id=new_id, **item.dict())
    items_db.append(new_item)
    return new_item


@app.put("/items/{item_id}", response_model=Item, tags=["items"])
async def update_item(
    item_update: ItemUpdate,
    item_id: int = Path(..., gt=0, description="The ID of the item to update"),
):
    item = next((i for i in items_db if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    return item


@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["items"])
async def delete_item(
    item_id: int = Path(..., gt=0, description="The ID of the item to delete"),
):
    item_index = next((i for i, itm in enumerate(items_db) if itm.id == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="Item not found")

    items_db.pop(item_index)
    return None


# Order endpoints
@app.get("/orders", response_model=List[Order], tags=["orders"])
async def get_orders(
    skip: int = Query(0, ge=0, description="Number of orders to skip"),
    limit: int = Query(
        10, ge=1, le=100, description="Maximum number of orders to return"
    ),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
):
    filtered_orders = orders_db
    if user_id is not None:
        filtered_orders = [o for o in filtered_orders if o.user_id == user_id]

    return filtered_orders[skip : skip + limit]


@app.get("/orders/{order_id}", response_model=Order, tags=["orders"])
async def get_order(
    order_id: int = Path(..., gt=0, description="The ID of the order to retrieve"),
):
    order = next((o for o in orders_db if o.id == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.post(
    "/orders",
    response_model=Order,
    status_code=status.HTTP_201_CREATED,
    tags=["orders"],
)
async def create_order(order: OrderCreate):
    # Verify user exists
    user = next((u for u in users_db if u.id == order.user_id), None)
    if not user:
        raise HTTPException(
            status_code=400, detail=f"User with ID {order.user_id} not found"
        )

    # Verify items exist and calculate total
    order_items = []
    total = 0.0
    for item_id in order.item_ids:
        item = next((i for i in items_db if i.id == item_id), None)
        if not item:
            raise HTTPException(
                status_code=400, detail=f"Item with ID {item_id} not found"
            )
        if not item.in_stock:
            raise HTTPException(
                status_code=400, detail=f"Item {item.name} is out of stock"
            )

        order_items.append({"id": item.id, "name": item.name, "price": item.price})
        total += item.price

    new_id = max(o.id for o in orders_db) + 1 if orders_db else 1
    new_order = Order(
        id=new_id,
        user_id=order.user_id,
        items=order_items,
        total=total,
        status="pending",
    )
    orders_db.append(new_order)
    return new_order


@app.delete(
    "/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["orders"]
)
async def delete_order(
    order_id: int = Path(..., gt=0, description="The ID of the order to delete"),
):
    order_index = next((i for i, o in enumerate(orders_db) if o.id == order_id), None)
    if order_index is None:
        raise HTTPException(status_code=404, detail="Order not found")

    orders_db.pop(order_index)
    return None


# Search endpoint
@app.get("/search", tags=["search"])
async def search_items(
    q: str = Query(..., min_length=1, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
):
    results = []
    for item in items_db:
        if q.lower() in item.name.lower() or q.lower() in item.category.lower():
            if category and item.category.lower() != category.lower():
                continue
            if max_price is not None and item.price > max_price:
                continue
            results.append(item)

    return {"query": q, "results": results, "count": len(results)}


# Statistics endpoint
@app.get("/stats", tags=["stats"])
async def get_statistics():
    return {
        "total_users": len(users_db),
        "total_items": len(items_db),
        "total_orders": len(orders_db),
        "items_in_stock": len([i for i in items_db if i.in_stock]),
        "average_item_price": sum(i.price for i in items_db) / len(items_db)
        if items_db
        else 0,
        "categories": list(set(i.category for i in items_db)),
    }


def main():
    typer.secho(
        "Starting FastAPI test server on http://localhost:8000", fg=typer.colors.GREEN
    )
    typer.secho(
        "OpenAPI specification available at: http://localhost:8000/openapi.json",
        fg=typer.colors.BLUE,
    )
    typer.secho(
        "Interactive docs available at: http://localhost:8000/docs",
        fg=typer.colors.BLUE,
    )

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)


if __name__ == "__main__":
    main()
