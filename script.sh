#!/bin/bash
find . -name "*.html" -exec sed -i 's/TechStore/TT\&DT/g' {} \;