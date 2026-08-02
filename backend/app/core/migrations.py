from sqlalchemy import inspect, text


def run_auto_migrations(engine, Base):
    inspector = inspect(engine)

    for table in Base.metadata.sorted_tables:
        table_name = table.name

        if not inspector.has_table(table_name):
            # Brand new table — create_all() already handles this, nothing to do here.
            continue

        existing_columns = {col["name"] for col in inspector.get_columns(table_name)}

        for column in table.columns:
            if column.name in existing_columns:
                continue

            # A new column was added to the model but doesn't exist in the DB yet.
            col_type = column.type.compile(dialect=engine.dialect)
            default_clause = _build_default_clause(column, col_type)

            ddl = f'ALTER TABLE "{table_name}" ADD COLUMN "{column.name}" {col_type}{default_clause}'
            print(f"[auto-migration] Adding missing column: {table_name}.{column.name}")
            with engine.connect() as conn:
                conn.execute(text(ddl))
                conn.commit()

        # Re-inspect (columns may have just changed above) and check whether
        # any existing column's NOT NULL requirement no longer matches the
        # model — e.g. a column that used to be required is now optional.
        existing_columns_info = {col["name"]: col for col in inspector.get_columns(table_name)}
        needs_rebuild = any(
            column.name in existing_columns_info
            and existing_columns_info[column.name]["nullable"] != column.nullable
            for column in table.columns
        )

        if needs_rebuild:
            _rebuild_table_with_new_schema(engine, table)


def _rebuild_table_with_new_schema(engine, table):
    """SQLite can't ALTER a column's NOT NULL constraint directly, so we
    rebuild the table: rename it aside, create a fresh one matching the
    current model, copy every row over, then drop the old one."""
    table_name = table.name
    tmp_name = f"{table_name}__migration_old"

    print(f"[auto-migration] Rebuilding table '{table_name}' to apply constraint changes...")

    with engine.begin() as conn:
        conn.execute(text(f'ALTER TABLE "{table_name}" RENAME TO "{tmp_name}"'))
        table.create(bind=conn)

        inspector = inspect(conn)
        old_columns = {col["name"] for col in inspector.get_columns(tmp_name)}
        shared_columns = [c.name for c in table.columns if c.name in old_columns]
        columns_csv = ", ".join(f'"{c}"' for c in shared_columns)

        conn.execute(text(
            f'INSERT INTO "{table_name}" ({columns_csv}) '
            f'SELECT {columns_csv} FROM "{tmp_name}"'
        ))
        conn.execute(text(f'DROP TABLE "{tmp_name}"'))

    print(f"[auto-migration] Done — '{table_name}' rebuilt, all existing rows preserved.")


def _build_default_clause(column, col_type):
    """Figures out a safe DEFAULT ... clause so existing rows get a sensible
    value for the new column (required by SQLite for NOT NULL columns)."""
    default_value = None

    if column.default is not None and getattr(column.default, "is_scalar", False):
        default_value = column.default.arg
    elif not column.nullable:
        # No explicit default but the column is required — fall back to a
        # type-appropriate blank value so existing rows don't break.
        type_name = str(col_type).upper()
        if "BOOL" in type_name or "INT" in type_name:
            default_value = 0
        elif "FLOAT" in type_name or "REAL" in type_name or "NUMERIC" in type_name:
            default_value = 0
        else:
            default_value = ""

    if default_value is None:
        return ""

    if isinstance(default_value, bool):
        return f" DEFAULT {1 if default_value else 0}"
    if isinstance(default_value, (int, float)):
        return f" DEFAULT {default_value}"

    # String default — escape any single quotes to keep the SQL valid.
    escaped = str(default_value).replace("'", "''")
    return f" DEFAULT '{escaped}'"