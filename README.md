# VisionCamera-base64

### WARNING

1. This repo is only tested on android, for now.
2. This repo is still on development.



<br/>

### About this repo

This repo provides a FrameProcessor plugin of [VisionCamera](https://github.com/mrousavy/react-native-vision-camera) which returns base64 string of realtime preview frame.



<br/>

### How to install

#### First, install dependencies

```
$ yarn install
```



<br/>

#### Second, you should manually modify some lines in `react-native-vision-camera` library.

we are going to use `react-native-vision-camera@2.10.0` with some modifications.

1. `node_modules/react-native-vision-camera/android/CMakeLists.txt`: erase lines below

```cmake
// erase line 90~95
find_library( 
         JSI_LIB 
         jsi 
         PATHS ${LIBRN_DIR} 
         NO_CMAKE_FIND_ROOT_PATH 
 )

...
// erase line 128
${JSI_LIB}
```



<br/>

2. `node_modules/react-native-vision-camera/android/src/main/cpp/FrameHostObject.cpp`: modify lines below

```cpp
// modify line 16 (make_local -> make_global)
FrameHostObject::FrameHostObject(jni::alias_ref<JImageProxy::javaobject> image): frame(make_global(image)) { }

// modify line 23 (= -> &)
jni::ThreadScope::WithClassLoader([&] { frame.reset(); });
```



<br/>

3. `node_modules/react-native-vision-camera/android/src/main/cpp/FrameHostObject.h`: modify lines below

```cpp
// modify line 31 (local_ref -> global_ref)
jni::global_ref<JImageProxy> frame;
```



<br/>

#### Finally, run

```
$ npx react-native run-android
```



