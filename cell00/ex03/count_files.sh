#!/bin/bash

# Count subdirectories (excluding the current directory '.')
dirs=$(find . -maxdepth 1 -type d ! -name '.' | wc -l)

# Count regular files
files=$(find . -maxdepth 1 -type f | wc -l)

echo "Directories: $dirs"
echo "Regular files: $files"