#!/bin/bash

# DO NOT PUSH THIS FILE TO GITHUB
# This file contains sensitive information and should be kept private

# TODO: Set your PostgreSQL URI - Use the External Database URL from the Render dashboard
PG_URI="postgresql://cu_market_db_oeit_user:cGPN3yiRb5s5wbFgrOyNIfTna1j3db7T@dpg-ctboc51u0jms73coovd0-a.oregon-postgres.render.com/cu_market_db_oeit"

# Execute each .sql file in the directory
for file in init_data/*.sql; do
    echo "Executing $file..."
    psql $PG_URI -f "$file"
done