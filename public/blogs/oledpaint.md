---
date: 07/02/2023
title: OLED Paint
tags:
- projects
authors:
  - Kunal Pai
  - Steven To
image: /images/oledpaint.jpeg
---

## Project Details

Our final lab project is a paint program similar to that of MSPaint. Using SPI, we allow the OLED screen to be the canvas that the user can paint on. The cursor that displays on the screen can be controlled by the user using the tilt readings acquired by the CC3200 accelerometer. The features that come with the program are similar to MSPaint and include things like changing colors, adjusting cursor size, erasing, and producing lines and shapes. These features can be accessed using an IR remote control and pressing the appropriate button depending on the tool.

## Goals

- To establish an SPI connection between the CC3200 and the OLED display
- To establish an I2C connection between the CC3200 and the accelerometer to obtain tilt readings
- To enable GPIO interrupts to detect instances of remote button pressing
- To decode additional buttons from the IR remote control using the Saleae logic analyzer for waveform analysis
- To develop code that exhibits different paint tools and functionalities depending on the button press of the IR remote control
- To connect our application to Wifi to send HTTP post requests
- To set up a backend Python server that will receive HTTP post requests from the CC3200

## Features

Corresponds to a button pressed on a TV Remote
- 1: Cursor
- 2: Brush
- 3: Eraser
- 4: Line
- 5: Triangle
- 6: Circle
- 7: Rectangle
- 8: Fill Screen with Cursor Color
- 9: Clear Screen with Black
- 0: Screenshot
- Chan+/-: Change Color
- Vol+/-: Change Cursor Size

## Discussion

- The first challenge we faced was the implementation of the cursor function, that just hovers over a painted area without affecting it. Since the Adafruit library does not have any "layer" functionality, we did this by creating two variants of the drawCircle and the fillCircle function. The regular function draws and fills the circle, while saving the stored color to the 2D 128 by 128 color buffer array. The drawCursor function draws a circle without saving the color, meaning that the color of the painted area would not be overridden by the cursor. The fillCursor function is the same as the fillCircle function, but, instead of writing the applied color onto the OLED, writes the color at that index that was saved into the 2D array. With this function, the original color is colored back into the OLED, and thus, the cursor helps the colors remain intact.

- The second challenge we faced was sending multiple POST requests to our Flask server. After sending one request, the POST body would not send. This was fixed by freeing the globally declared string variable that stores the generated body from the generateBodyBitmap function, after the POST request has been sent.

- The third challenge we faced was rendering the whole image. The original way we were sending the bitmap was in columns of 2 from 0 to 128, converting the integers of the colors as defined in "test.h" into strings and sending it separated by commas (for example: "65535,0,65535" represents a column where the three pixels are white, black, and white). This was inefficient, as we could only send 2 rows at a time, and the entire image could be generated only after 64 iterations. We improved the performance by encoding every color to one particular character and removing the comma separator, since we now know that every color is one character. On the backend side, we received a string of 16384 characters which we divided into 128 chunks and every chunk into 128 chunks, giving us the 2D array we need. Since we already had a lookup table defined, we changed it to account for the characters. This let us send 8 rows at a time, completing image rendering in 16 iterations, a 4 times faster performance.

<h2 class="title">Demo Videos</h2>
<div>
    <div class="lists">
        <iframe width="500px" height="420px"
        src="https://www.youtube.com/embed/Ygi-eUjCqoY">
        </iframe>
        </br>
        </br>
        <iframe width="500px" height="420px"
        src="https://www.youtube.com/embed/b3hn-VovGC8">
        </iframe>
        </br>
        </br>
    </div>
</div>

## Code

<a href="https://github.com/kunpai/OLEDPaint">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
</svg>
GitHub
</a>
