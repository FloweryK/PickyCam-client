package com.flowerk.vision09;

import android.annotation.SuppressLint;
import android.graphics.ImageFormat;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.media.Image;
import android.util.Base64;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.camera.core.ImageProxy;

import com.facebook.react.bridge.WritableNativeMap;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;

public class SampleFrameProcessorPlugin extends FrameProcessorPlugin {
    private String ImageToBase64(Image image) {
        // Image -> YuvImage
        if (image.getFormat() != ImageFormat.YUV_420_888) {
            throw new IllegalArgumentException("Invalid image format");
        }

        int width = image.getWidth();   // 640
        int height = image.getHeight(); // 480

        // Order of U/V channel guaranteed, read more:
        // https://developer.android.com/reference/android/graphics/ImageFormat#YUV_420_888
        Image.Plane yPlane = image.getPlanes()[0];
        Image.Plane uPlane = image.getPlanes()[1];
        Image.Plane vPlane = image.getPlanes()[2];

        ByteBuffer yBuffer = yPlane.getBuffer(); // 307200
        ByteBuffer uBuffer = uPlane.getBuffer(); // 76800
        ByteBuffer vBuffer = vPlane.getBuffer(); // 76800

        // Full size Y channel and quarter size U*V channels
        int numPixels = (int) (width * height * 1.5f);
        byte[] nv21 = new byte[numPixels];
        int index = 0;

        // Copy Y channel
        int yRowStride = yPlane.getRowStride();     // 640
        int yPixelStride = yPlane.getPixelStride(); // 1

        for (int x = 0; x < width; ++x) {
            for (int y = height-1; y > -1; --y) {
                int bufferIndex = y * yRowStride + x * yPixelStride;
                nv21[index++] = yBuffer.get(bufferIndex);
            }
        }

        // Copy VU data; NV21 format is expected to have YYYYVU packaging.
        // The U/V planes are guaranteed to have the same row stride and pixel stride.
        int uvRowStride = uPlane.getRowStride();        // 320
        int uvPixelStride = uPlane.getPixelStride();    // 1
        int uvWidth = width / 2;
        int uvHeight = height / 2;

        for (int x = 0; x < uvWidth; ++x) {
            for (int y = uvHeight-1; y > -1; --y) {
                int bufferIndex = (y * uvRowStride) + (x * uvPixelStride);
                nv21[index++] = vBuffer.get(bufferIndex);   // V Channel.
                nv21[index++] = uBuffer.get(bufferIndex);   // U channel.
            }
        }

        YuvImage yuvImage = new YuvImage(nv21, ImageFormat.NV21, height, width,null);

        // YuvImage -> Jpeg
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        yuvImage.compressToJpeg(new Rect(0, 0, height, width), 40, out);
        byte[] jpegImage = out.toByteArray();

        return Base64.encodeToString(jpegImage, Base64.DEFAULT);
    }

    @Nullable
    @Override
    public Object callback(@NonNull ImageProxy image, @NonNull Object[] params) {
        // get base64
        @SuppressLint("UnsafeOptInUsageError") Image imageImage = image.getImage();
        assert imageImage != null;
        String encoded = ImageToBase64(imageImage);

        // get format
        int format = image.getFormat();

        // put into map
        WritableNativeMap map = new WritableNativeMap();
        map.putString("encoded", encoded);
        map.putInt("format", format);

        return map;
    }

    SampleFrameProcessorPlugin() {
        super("sampleFrame");
    }
}
