#!/bin/bash

# Docker Hub publish script for Family Evening App
# Usage: ./docker-publish.sh [version]
# Example: ./docker-publish.sh v0.3.0

set -e

DOCKER_HUB_USER="sdgadmin"
IMAGE_NAME="familyevening"
LOCAL_IMAGE="familyevening-app:latest"

# Get version from argument or git tag
if [ -n "$1" ]; then
    VERSION="$1"
else
    VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "latest")
fi

echo "🚀 Publishing Docker image to Docker Hub"
echo "========================================="
echo "Docker Hub: ${DOCKER_HUB_USER}/${IMAGE_NAME}"
echo "Version: ${VERSION}"
echo ""

# Check if logged in to Docker Hub
echo "🔐 Checking Docker Hub authentication..."
if ! docker info | grep -q "Username: ${DOCKER_HUB_USER}"; then
    echo "⚠️  You are not logged in to Docker Hub"
    echo "Please run: docker login"
    exit 1
fi
echo "✅ Authenticated as ${DOCKER_HUB_USER}"
echo ""

# Tag the image
echo "🏷️  Tagging images..."
docker tag ${LOCAL_IMAGE} ${DOCKER_HUB_USER}/${IMAGE_NAME}:${VERSION}
docker tag ${LOCAL_IMAGE} ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest
echo "✅ Tagged as:"
echo "   - ${DOCKER_HUB_USER}/${IMAGE_NAME}:${VERSION}"
echo "   - ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"
echo ""

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
echo ""
docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${VERSION}
echo ""
docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest
echo ""

echo "✅ Successfully published to Docker Hub!"
echo ""
echo "📦 Your image is now available at:"
echo "   https://hub.docker.com/r/${DOCKER_HUB_USER}/${IMAGE_NAME}"
echo ""
echo "🎯 Anyone can now pull your image with:"
echo "   docker pull ${DOCKER_HUB_USER}/${IMAGE_NAME}:${VERSION}"
echo "   docker pull ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"
echo ""
