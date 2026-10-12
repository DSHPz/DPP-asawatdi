#!/bin/bash

if [ $# -eq 0 ]; then
    echo "No arguments supplied"
    exit 0
fi

for arg in "$@"; do
    folder="ex${arg}"

    if [ -d "$folder" ]; then
        echo "Folder '$folder' already exists"
    else
        mkdir "$folder"
        if [ $? -eq 0 ]; then
            echo "Folder '$folder' created successfully"
        else
            echo "Error: Cannot create folder '$folder'"
        fi
    fi
done
