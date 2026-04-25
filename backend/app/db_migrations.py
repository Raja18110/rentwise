from sqlalchemy import inspect, text

from app.db import engine


TYPE_SQL = {
    "postgresql": {
        "integer": "INTEGER",
        "float": "DOUBLE PRECISION",
        "string": "VARCHAR",
        "text": "TEXT",
        "datetime": "TIMESTAMP",
    },
    "default": {
        "integer": "INTEGER",
        "float": "FLOAT",
        "string": "VARCHAR",
        "text": "TEXT",
        "datetime": "DATETIME",
    },
}


REQUIRED_COLUMNS = {
    "users": {
        "email": "string",
        "username": "string",
        "password_hash": "string",
        "role": "string",
    },
    "properties": {
        "landlord_id": "integer",
        "landlord_email": "string",
        "name": "string",
        "location": "string",
        "description": "text",
        "rent": "float",
        "deposit": "float",
        "bhk": "string",
        "area": "string",
        "furnished": "string",
        "status": "string",
        "created_at": "datetime",
        "updated_at": "datetime",
    },
    "leases": {
        "property_id": "integer",
        "landlord_id": "integer",
        "tenant_id": "integer",
        "property_name": "string",
        "tenant_email": "string",
        "landlord_email": "string",
        "rent_amount": "float",
        "frequency": "string",
        "deposit": "float",
        "start_date": "string",
        "end_date": "string",
        "status": "string",
        "created_at": "datetime",
        "updated_at": "datetime",
    },
    "requests": {
        "lease_id": "integer",
        "property_id": "integer",
        "tenant_id": "integer",
        "landlord_id": "integer",
        "title": "string",
        "message": "text",
        "tenant_email": "string",
        "landlord_email": "string",
        "request_type": "string",
        "priority": "string",
        "status": "string",
        "created_at": "datetime",
        "updated_at": "datetime",
    },
    "payments": {
        "lease_id": "integer",
        "tenant_id": "integer",
        "landlord_id": "integer",
        "tenant_email": "string",
        "landlord_email": "string",
        "amount": "float",
        "type": "string",
        "status": "string",
        "razorpay_order_id": "string",
        "razorpay_payment_id": "string",
        "created_at": "datetime",
        "updated_at": "datetime",
    },
    "notifications": {
        "user_id": "integer",
        "email": "string",
        "message": "string",
        "title": "string",
        "notification_type": "string",
        "related_id": "integer",
        "status": "string",
        "created_at": "datetime",
        "updated_at": "datetime",
    },
}


def _type_sql(column_type: str) -> str:
    dialect_types = TYPE_SQL.get(engine.dialect.name, TYPE_SQL["default"])
    return dialect_types[column_type]


def _columns(connection, table_name: str) -> set[str]:
    return {column["name"] for column in inspect(connection).get_columns(table_name)}


def _table_names(connection) -> set[str]:
    return set(inspect(connection).get_table_names())


def _add_column(connection, table_name: str, column_name: str, column_type: str):
    connection.execute(
        text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {_type_sql(column_type)}")
    )


def _backfill_defaults(connection, table_name: str, columns: set[str]):
    if "status" in columns:
        defaults = {
            "properties": "available",
            "leases": "pending",
            "requests": "pending",
            "payments": "success",
            "notifications": "unread",
        }
        default_status = defaults.get(table_name)
        if default_status:
            connection.execute(
                text(f"UPDATE {table_name} SET status = :value WHERE status IS NULL"),
                {"value": default_status},
            )

    if "frequency" in columns:
        connection.execute(
            text("UPDATE leases SET frequency = 'monthly' WHERE frequency IS NULL")
        )

    if "furnished" in columns:
        connection.execute(
            text("UPDATE properties SET furnished = 'unfurnished' WHERE furnished IS NULL")
        )

    if "request_type" in columns:
        connection.execute(
            text("UPDATE requests SET request_type = 'maintenance' WHERE request_type IS NULL")
        )

    if "priority" in columns:
        connection.execute(
            text("UPDATE requests SET priority = 'normal' WHERE priority IS NULL")
        )

    if "notification_type" in columns:
        connection.execute(
            text("UPDATE notifications SET notification_type = 'general' WHERE notification_type IS NULL")
        )

    if "type" in columns:
        connection.execute(
            text("UPDATE payments SET type = 'rent' WHERE type IS NULL")
        )

    if "created_at" in columns:
        if engine.dialect.name == "postgresql":
            connection.execute(
                text(f"UPDATE {table_name} SET created_at = NOW() WHERE created_at IS NULL")
            )
        else:
            connection.execute(
                text(f"UPDATE {table_name} SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL")
            )

    if "updated_at" in columns:
        if engine.dialect.name == "postgresql":
            connection.execute(
                text(f"UPDATE {table_name} SET updated_at = NOW() WHERE updated_at IS NULL")
            )
        else:
            connection.execute(
                text(f"UPDATE {table_name} SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL")
            )


def _backfill_relationships(connection):
    tables = _table_names(connection)

    if "payments" in tables:
        columns = _columns(connection, "payments")
        if {"email", "tenant_email"}.issubset(columns):
            connection.execute(
                text("UPDATE payments SET tenant_email = email WHERE tenant_email IS NULL")
            )

    if {"leases", "properties"}.issubset(tables):
        lease_columns = _columns(connection, "leases")
        property_columns = _columns(connection, "properties")

        if {"property_id", "landlord_email"}.issubset(lease_columns) and "landlord_email" in property_columns:
            if engine.dialect.name == "postgresql":
                connection.execute(
                    text(
                        """
                        UPDATE leases
                        SET landlord_email = properties.landlord_email
                        FROM properties
                        WHERE leases.property_id = properties.id
                        AND leases.landlord_email IS NULL
                        """
                    )
                )
            else:
                connection.execute(
                    text(
                        """
                        UPDATE leases
                        SET landlord_email = (
                            SELECT properties.landlord_email
                            FROM properties
                            WHERE properties.id = leases.property_id
                        )
                        WHERE landlord_email IS NULL
                        """
                    )
                )

        if {"property_id", "landlord_id"}.issubset(lease_columns) and "landlord_id" in property_columns:
            if engine.dialect.name == "postgresql":
                connection.execute(
                    text(
                        """
                        UPDATE leases
                        SET landlord_id = properties.landlord_id
                        FROM properties
                        WHERE leases.property_id = properties.id
                        AND leases.landlord_id IS NULL
                        """
                    )
                )
            else:
                connection.execute(
                    text(
                        """
                        UPDATE leases
                        SET landlord_id = (
                            SELECT properties.landlord_id
                            FROM properties
                            WHERE properties.id = leases.property_id
                        )
                        WHERE landlord_id IS NULL
                        """
                    )
                )


def run_startup_migrations():
    """Repair deployed databases created before the current SQLAlchemy models."""
    with engine.begin() as connection:
        tables = _table_names(connection)

        for table_name, required_columns in REQUIRED_COLUMNS.items():
            if table_name not in tables:
                continue

            existing_columns = _columns(connection, table_name)
            for column_name, column_type in required_columns.items():
                if column_name not in existing_columns:
                    _add_column(connection, table_name, column_name, column_type)
                    existing_columns.add(column_name)

            _backfill_defaults(connection, table_name, existing_columns)

        _backfill_relationships(connection)
