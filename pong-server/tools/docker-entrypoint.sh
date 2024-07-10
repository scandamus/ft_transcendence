#!/bin/bash

echo "Waiting for PostgreSQL to start..."
for i in {60..0}; do
    if pg_isready -h db -p 5432 -U $POSTGRES_USER; then
        echo "PostgreSQL is ready"
        break;
    fi
    if [ "$i" -eq 0 ]; then
        echo "Error: PostgreSQL is not ready within expected time."
        exit 1
    fi
    sleep 1
    echo "wait counter: $i"
done

exec "$@"