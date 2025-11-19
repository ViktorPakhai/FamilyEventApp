#!/bin/bash

# Multi-platform Docker Hub publish script for Family Evening App
# Builds and pushes images for linux/amd64 and linux/arm64
# Usage: ./docker-publish-multiplatform.sh [version]
# Example: ./docker-publish-multiplatform.sh v0.5.0

set -e

DOCKER_HUB_USER="sdgadmin"
IMAGE_NAME="familyevening"
PLATFORMS="linux/amd64,linux/arm64"

# Get version from argument or git tag
if [ -n "$1" ]; then
    VERSION="$1"
else
    VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "latest")
fi

echo "🚀 Building and Publishing Multi-Platform Docker Image"
echo "======================================================="
echo "Docker Hub: ${DOCKER_HUB_USER}/${IMAGE_NAME}"
echo "Version: ${VERSION}"
echo "Platforms: ${PLATFORMS}"
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

# Setup buildx builder
echo "🔧 Setting up Docker buildx..."
if ! docker buildx inspect multiplatform &>/dev/null; then
    docker buildx create --name multiplatform --use --bootstrap
    echo "✅ Created multiplatform builder"
else
    docker buildx use multiplatform
    echo "✅ Using existing multiplatform builder"
fi
echo ""

# Build and push multi-platform images
echo "🏗️  Building and pushing multi-platform images..."
echo "This may take several minutes..."
echo ""

docker buildx build \
    --platform ${PLATFORMS} \
    --tag ${DOCKER_HUB_USER}/${IMAGE_NAME}:${VERSION} \
    --tag ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest \
    --push \
    .

echo ""
echo "✅ Successfully built and published multi-platform images!"
echo ""
echo "📦 Your images are now available at:"
echo "   https://hub.docker.com/r/${DOCKER_HUB_USER}/${IMAGE_NAME}"
echo ""
echo "🎯 Supported platforms:"
echo "   - linux/amd64 (Intel/AMD x86_64)"
echo "   - linux/arm64 (Apple Silicon, ARM servers)"
echo ""
echo "📥 Anyone can now pull your image with:"
echo "   docker pull ${DOCKER_HUB_USER}/${IMAGE_NAME}:${VERSION}"
echo "   docker pull ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"
echo ""
echo "Docker will automatically pull the correct platform for their system!"
echo ""
