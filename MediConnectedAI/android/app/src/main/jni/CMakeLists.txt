# Copyright (c) Meta Platforms, Inc. and affiliates.
# Copied from React Native default-app-setup so Windows builds can cap
# CMake object path length (ninja fails above MAX_PATH 260).

cmake_minimum_required(VERSION 3.13)

set(CMAKE_OBJECT_PATH_MAX 200 CACHE STRING "Cap object paths for Windows ninja" FORCE)

project(appmodules)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)
